package main

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/csv"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/glebarez/sqlite"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	defaultBatchSize = 1000
	maxBatchSize     = 5000
	defaultTimeout   = 30 * time.Minute
	awsAlgorithm     = "AWS4-HMAC-SHA256"
	r2Service        = "s3"
)

type config struct {
	SQLDSN          string
	SQLitePath      string
	BatchSize       int
	BatchSleep      time.Duration
	OutputDir       string
	Where           string
	Date            string
	Timeout         time.Duration
	R2AccountID     string
	R2AccessKeyID   string
	R2SecretKey     string
	R2Bucket        string
	R2ObjectPrefix  string
	R2PublicBaseURL string
	FeishuWebhook   string
	FeishuKeyword   string
}

type tokenRow struct {
	ID                 int
	UserID             int
	Key                string
	Status             int
	Name               string
	CreatedTime        int64
	AccessedTime       int64
	ExpiredTime        int64
	RemainQuota        int
	UnlimitedQuota     bool
	ModelLimitsEnabled bool
	ModelLimits        string
	AllowIPs           sql.NullString
	UsedQuota          int
	Group              string
	CrossGroupRetry    bool
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
	_ = godotenv.Load()

	cfg, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), cfg.Timeout)
	defer cancel()

	db, err := openDB(cfg)
	if err != nil {
		log.Fatal(err)
	}

	filePath, count, err := exportTokens(ctx, db, cfg)
	if err != nil {
		log.Fatal(err)
	}

	link := filePath
	if cfg.r2Enabled() {
		link, err = uploadToR2(ctx, cfg, filePath)
		if err != nil {
			log.Fatal(err)
		}
	}

	if cfg.FeishuWebhook != "" {
		if err := notifyFeishu(ctx, cfg, link, count); err != nil {
			log.Fatal(err)
		}
	}

	log.Printf("token export finished: rows=%d link=%s", count, link)
}

func loadConfig() (config, error) {
	cfg := config{
		SQLDSN:          strings.TrimSpace(os.Getenv("SQL_DSN")),
		SQLitePath:      strings.TrimSpace(getEnv("SQLITE_PATH", common.SQLitePath)),
		BatchSize:       getEnvInt("TOKEN_EXPORT_BATCH_SIZE", defaultBatchSize),
		BatchSleep:      time.Duration(getEnvInt("TOKEN_EXPORT_BATCH_SLEEP_MS", 50)) * time.Millisecond,
		OutputDir:       strings.TrimSpace(getEnv("TOKEN_EXPORT_OUTPUT_DIR", "data/token-exports")),
		Where:           strings.TrimSpace(os.Getenv("TOKEN_EXPORT_WHERE")),
		Date:            strings.TrimSpace(os.Getenv("TOKEN_EXPORT_DATE")),
		Timeout:         time.Duration(getEnvInt("TOKEN_EXPORT_TIMEOUT_MINUTES", int(defaultTimeout/time.Minute))) * time.Minute,
		R2AccountID:     strings.TrimSpace(os.Getenv("R2_ACCOUNT_ID")),
		R2AccessKeyID:   strings.TrimSpace(os.Getenv("R2_ACCESS_KEY_ID")),
		R2SecretKey:     strings.TrimSpace(os.Getenv("R2_SECRET_ACCESS_KEY")),
		R2Bucket:        strings.TrimSpace(os.Getenv("R2_BUCKET")),
		R2ObjectPrefix:  strings.Trim(strings.TrimSpace(os.Getenv("R2_OBJECT_PREFIX")), "/"),
		R2PublicBaseURL: strings.TrimRight(strings.TrimSpace(os.Getenv("R2_PUBLIC_BASE_URL")), "/"),
		FeishuWebhook:   strings.TrimSpace(os.Getenv("FEISHU_WEBHOOK_URL")),
		FeishuKeyword:   strings.TrimSpace(os.Getenv("FEISHU_KEYWORD")),
	}

	if cfg.Date == "" {
		cfg.Date = time.Now().Format("2006-01-02")
	}
	if cfg.BatchSize <= 0 {
		cfg.BatchSize = defaultBatchSize
	}
	if cfg.BatchSize > maxBatchSize {
		cfg.BatchSize = maxBatchSize
	}
	if cfg.OutputDir == "" {
		cfg.OutputDir = "."
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = defaultTimeout
	}
	if err := validateWhere(cfg.Where); err != nil {
		return cfg, err
	}
	if cfg.r2PartiallyConfigured() {
		return cfg, errors.New("R2 upload requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET")
	}
	return cfg, nil
}

func (cfg config) r2Enabled() bool {
	return cfg.R2AccountID != "" && cfg.R2AccessKeyID != "" && cfg.R2SecretKey != "" && cfg.R2Bucket != ""
}

func (cfg config) r2PartiallyConfigured() bool {
	values := []string{cfg.R2AccountID, cfg.R2AccessKeyID, cfg.R2SecretKey, cfg.R2Bucket}
	set := 0
	for _, value := range values {
		if value != "" {
			set++
		}
	}
	return set > 0 && set < len(values)
}

func openDB(cfg config) (*gorm.DB, error) {
	if cfg.SQLDSN == "" || strings.HasPrefix(cfg.SQLDSN, "local") {
		return gorm.Open(sqlite.Open(cfg.SQLitePath), &gorm.Config{})
	}
	if strings.HasPrefix(cfg.SQLDSN, "postgres://") || strings.HasPrefix(cfg.SQLDSN, "postgresql://") {
		return gorm.Open(postgres.New(postgres.Config{DSN: cfg.SQLDSN, PreferSimpleProtocol: true}), &gorm.Config{})
	}
	if !strings.Contains(cfg.SQLDSN, "parseTime") {
		if strings.Contains(cfg.SQLDSN, "?") {
			cfg.SQLDSN += "&parseTime=true"
		} else {
			cfg.SQLDSN += "?parseTime=true"
		}
	}
	return gorm.Open(mysql.Open(cfg.SQLDSN), &gorm.Config{})
}

func exportTokens(ctx context.Context, db *gorm.DB, cfg config) (string, int, error) {
	if err := os.MkdirAll(cfg.OutputDir, 0o755); err != nil {
		return "", 0, err
	}

	filePath := filepath.Join(cfg.OutputDir, fmt.Sprintf("tokens-%s.csv", cfg.Date))
	file, err := os.Create(filePath)
	if err != nil {
		return "", 0, err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	if err := writer.Write([]string{
		"id", "user_id", "key", "status", "name", "created_time", "accessed_time", "expired_time",
		"remain_quota", "unlimited_quota", "model_limits_enabled", "model_limits", "allow_ips",
		"used_quota", "group", "cross_group_retry",
	}); err != nil {
		return "", 0, err
	}

	lastID := 0
	total := 0
	for {
		var rows []tokenRow
		query := db.WithContext(ctx).Table("tokens").Select(selectTokenColumns(db)).Where("id > ?", lastID)
		if cfg.Where != "" {
			query = query.Where(cfg.Where)
		}

		err := query.Order("id asc").Limit(cfg.BatchSize).Scan(&rows).Error
		if err != nil {
			return "", total, err
		}
		if len(rows) == 0 {
			break
		}

		for _, row := range rows {
			allowIPs := ""
			if row.AllowIPs.Valid {
				allowIPs = row.AllowIPs.String
			}
			if err := writer.Write([]string{
				strconv.Itoa(row.ID), strconv.Itoa(row.UserID), "sk-" + row.Key, strconv.Itoa(row.Status), row.Name,
				strconv.FormatInt(row.CreatedTime, 10), strconv.FormatInt(row.AccessedTime, 10), strconv.FormatInt(row.ExpiredTime, 10),
				strconv.Itoa(row.RemainQuota), strconv.FormatBool(row.UnlimitedQuota), strconv.FormatBool(row.ModelLimitsEnabled), row.ModelLimits,
				allowIPs, strconv.Itoa(row.UsedQuota), row.Group, strconv.FormatBool(row.CrossGroupRetry),
			}); err != nil {
				return "", total, err
			}
		}

		lastID = rows[len(rows)-1].ID
		total += len(rows)
		writer.Flush()
		if err := writer.Error(); err != nil {
			return "", total, err
		}
		if cfg.BatchSleep > 0 {
			select {
			case <-ctx.Done():
				return "", total, ctx.Err()
			case <-time.After(cfg.BatchSleep):
			}
		}
	}

	return filePath, total, writer.Error()
}

func selectTokenColumns(db *gorm.DB) string {
	quote := func(column string) string {
		if db.Dialector.Name() == "postgres" {
			return `"` + column + `"`
		}
		return "`" + column + "`"
	}
	return strings.Join([]string{
		"id", "user_id", quote("key"), "status", "name", "created_time", "accessed_time", "expired_time",
		"remain_quota", "unlimited_quota", "model_limits_enabled", "model_limits", "allow_ips",
		"used_quota", quote("group"), "cross_group_retry",
	}, ", ")
}

func uploadToR2(ctx context.Context, cfg config, filePath string) (string, error) {
	body, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	objectKey := filepath.Base(filePath)
	if cfg.R2ObjectPrefix != "" {
		objectKey = cfg.R2ObjectPrefix + "/" + objectKey
	}
	escapedKey := escapeObjectKey(objectKey)
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s", cfg.R2AccountID, cfg.R2Bucket, escapedKey)

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "text/csv; charset=utf-8")
	req.Header.Set("X-Amz-Content-Sha256", sha256Hex(body))
	signR2Request(req, cfg, body)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return "", fmt.Errorf("R2 upload failed: status=%d body=%s", resp.StatusCode, string(message))
	}

	if cfg.R2PublicBaseURL != "" {
		return cfg.R2PublicBaseURL + "/" + escapedKey, nil
	}
	return endpoint, nil
}

func signR2Request(req *http.Request, cfg config, body []byte) {
	now := time.Now().UTC()
	amzDate := now.Format("20060102T150405Z")
	dateStamp := now.Format("20060102")
	credentialScope := dateStamp + "/auto/" + r2Service + "/aws4_request"

	req.Header.Set("Host", req.URL.Host)
	req.Header.Set("X-Amz-Date", amzDate)

	signedHeaders := "content-type;host;x-amz-content-sha256;x-amz-date"
	canonicalHeaders := "content-type:" + req.Header.Get("Content-Type") + "\n" +
		"host:" + req.URL.Host + "\n" +
		"x-amz-content-sha256:" + sha256Hex(body) + "\n" +
		"x-amz-date:" + amzDate + "\n"
	canonicalRequest := strings.Join([]string{
		req.Method,
		req.URL.EscapedPath(),
		"",
		canonicalHeaders,
		signedHeaders,
		sha256Hex(body),
	}, "\n")

	stringToSign := strings.Join([]string{
		awsAlgorithm,
		amzDate,
		credentialScope,
		sha256Hex([]byte(canonicalRequest)),
	}, "\n")
	signature := hex.EncodeToString(hmacSHA256(signingKey(cfg.R2SecretKey, dateStamp), []byte(stringToSign)))
	auth := fmt.Sprintf("%s Credential=%s/%s, SignedHeaders=%s, Signature=%s", awsAlgorithm, cfg.R2AccessKeyID, credentialScope, signedHeaders, signature)
	req.Header.Set("Authorization", auth)
}

func signingKey(secret, dateStamp string) []byte {
	kDate := hmacSHA256([]byte("AWS4"+secret), []byte(dateStamp))
	kRegion := hmacSHA256(kDate, []byte("auto"))
	kService := hmacSHA256(kRegion, []byte(r2Service))
	return hmacSHA256(kService, []byte("aws4_request"))
}

func notifyFeishu(ctx context.Context, cfg config, link string, count int) error {
	message := fmt.Sprintf("tokens 导出完成\n日期：%s\n行数：%d\n链接：%s", cfg.Date, count, link)
	if cfg.FeishuKeyword != "" {
		message = cfg.FeishuKeyword + "\n" + message
	}
	payload, err := common.Marshal(map[string]any{
		"msg_type": "text",
		"content": map[string]string{
			"text": message,
		},
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, cfg.FeishuWebhook, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return fmt.Errorf("feishu notify failed: status=%d body=%s", resp.StatusCode, string(message))
	}
	return nil
}

func validateWhere(where string) error {
	if where == "" {
		return nil
	}
	blocked := []string{";", "--", "/*", "*/", " drop ", " delete ", " update ", " insert ", " alter ", " truncate "}
	lower := " " + strings.ToLower(where) + " "
	for _, value := range blocked {
		if strings.Contains(lower, value) {
			return fmt.Errorf("TOKEN_EXPORT_WHERE contains blocked SQL fragment %q", strings.TrimSpace(value))
		}
	}
	return nil
}

func escapeObjectKey(key string) string {
	parts := strings.Split(key, "/")
	for i := range parts {
		parts[i] = url.PathEscape(parts[i])
	}
	return strings.Join(parts, "/")
}

func sha256Hex(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

func hmacSHA256(key []byte, data []byte) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write(data)
	return mac.Sum(nil)
}

func getEnv(name string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return fallback
	}
	return value
}

func getEnvInt(name string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
