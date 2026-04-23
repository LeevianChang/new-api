package model

import (
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"

	"gorm.io/gorm"
)

// ErrRedeemFailed is returned when redemption fails due to database error
var ErrRedeemFailed = errors.New("redeem.failed")
var ErrRedeemTokenNotFound = errors.New("redeem.token_not_found")
var ErrRedeemTokenDisabled = errors.New("redeem.token_disabled")
var ErrRedemptionInvalid = errors.New("redemption.invalid")
var ErrRedemptionUsed = errors.New("redemption.used")
var ErrRedemptionExpired = errors.New("redemption.expired")

const (
	RedemptionTargetTypeUser  = "user"
	RedemptionTargetTypeToken = "token"
)

func NormalizeRedemptionTargetType(targetType string) string {
	switch strings.ToLower(strings.TrimSpace(targetType)) {
	case RedemptionTargetTypeToken:
		return RedemptionTargetTypeToken
	default:
		return RedemptionTargetTypeUser
	}
}

type Redemption struct {
	Id                   int            `json:"id"`
	UserId               int            `json:"user_id"`
	Key                  string         `json:"key" gorm:"type:char(32);uniqueIndex"`
	Status               int            `json:"status" gorm:"default:1"`
	Name                 string         `json:"name" gorm:"index"`
	TargetType           string         `json:"target_type" gorm:"type:varchar(16);default:user;index"`
	Quota                int            `json:"quota" gorm:"default:100"`
	CreatedTime          int64          `json:"created_time" gorm:"bigint"`
	RedeemedTime         int64          `json:"redeemed_time" gorm:"bigint"`
	Count                int            `json:"count" gorm:"-:all"` // only for api request
	UsedUserId           int            `json:"used_user_id"`
	RedeemedTokenId      int            `json:"redeemed_token_id"`
	RedeemedTokenKeyHash string         `json:"redeemed_token_key_hash" gorm:"type:varchar(64)"`
	RedeemedIP           string         `json:"redeemed_ip" gorm:"type:varchar(64)"`
	RedeemedUA           string         `json:"redeemed_ua" gorm:"type:text"`
	DeletedAt            gorm.DeletedAt `gorm:"index"`
	ExpiredTime          int64          `json:"expired_time" gorm:"bigint"` // 过期时间，0 表示不过期
}

func GetAllRedemptions(startIdx int, num int) (redemptions []*Redemption, total int64, err error) {
	// 开始事务
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 获取总数
	err = tx.Model(&Redemption{}).Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// 获取分页数据
	err = tx.Order("id desc").Limit(num).Offset(startIdx).Find(&redemptions).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// 提交事务
	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}

	return redemptions, total, nil
}

func SearchRedemptions(keyword string, startIdx int, num int) (redemptions []*Redemption, total int64, err error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Build query based on keyword type
	query := tx.Model(&Redemption{})

	// Only try to convert to ID if the string represents a valid integer
	if id, err := strconv.Atoi(keyword); err == nil {
		query = query.Where("id = ? OR name LIKE ?", id, keyword+"%")
	} else {
		query = query.Where("name LIKE ?", keyword+"%")
	}

	// Get total count
	err = query.Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// Get paginated data
	err = query.Order("id desc").Limit(num).Offset(startIdx).Find(&redemptions).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}

	return redemptions, total, nil
}

func GetRedemptionById(id int) (*Redemption, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	redemption := Redemption{Id: id}
	var err error = nil
	err = DB.First(&redemption, "id = ?", id).Error
	return &redemption, err
}

func Redeem(key string, userId int) (quota int, err error) {
	if key == "" {
		return 0, errors.New("未提供兑换码")
	}
	if userId == 0 {
		return 0, errors.New("无效的 user id")
	}
	redemption := &Redemption{}

	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	common.RandomSleep()
	err = DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Set("gorm:query_option", "FOR UPDATE").Where(keyCol+" = ?", key).First(redemption).Error
		if err != nil {
			return ErrRedemptionInvalid
		}
		if NormalizeRedemptionTargetType(redemption.TargetType) != RedemptionTargetTypeUser {
			return ErrRedemptionInvalid
		}
		if redemption.Status != common.RedemptionCodeStatusEnabled {
			return ErrRedemptionUsed
		}
		if redemption.ExpiredTime != 0 && redemption.ExpiredTime < common.GetTimestamp() {
			return ErrRedemptionExpired
		}
		err = tx.Model(&User{}).Where("id = ?", userId).Update("quota", gorm.Expr("quota + ?", redemption.Quota)).Error
		if err != nil {
			return err
		}
		redemption.RedeemedTime = common.GetTimestamp()
		redemption.Status = common.RedemptionCodeStatusUsed
		redemption.UsedUserId = userId
		redemption.RedeemedTokenId = 0
		redemption.RedeemedTokenKeyHash = ""
		redemption.RedeemedIP = ""
		redemption.RedeemedUA = ""
		err = tx.Save(redemption).Error
		return err
	})
	if err != nil {
		if errors.Is(err, ErrRedemptionInvalid) || errors.Is(err, ErrRedemptionUsed) || errors.Is(err, ErrRedemptionExpired) {
			return 0, err
		}
		common.SysError("redemption failed: " + err.Error())
		return 0, ErrRedeemFailed
	}
	RecordLog(userId, LogTypeTopup, fmt.Sprintf("通过兑换码充值 %s，兑换码ID %d", logger.LogQuota(redemption.Quota), redemption.Id))
	return redemption.Quota, nil
}

func RedeemForToken(code string, userId int, tokenId int, tokenKey string, clientIP string, userAgent string) (quota int, err error) {
	if code == "" {
		return 0, errors.New("未提供兑换码")
	}
	if userId == 0 || tokenId == 0 {
		return 0, errors.New("无效的 token")
	}
	redemption := &Redemption{}

	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	hashedTokenKey := hex.EncodeToString(common.Sha256Raw([]byte(tokenKey)))
	now := common.GetTimestamp()
	common.RandomSleep()
	err = DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Set("gorm:query_option", "FOR UPDATE").Where(keyCol+" = ?", code).First(redemption).Error
		if err != nil {
			return ErrRedemptionInvalid
		}
		if NormalizeRedemptionTargetType(redemption.TargetType) != RedemptionTargetTypeToken {
			return ErrRedemptionInvalid
		}
		if redemption.Status != common.RedemptionCodeStatusEnabled {
			return ErrRedemptionUsed
		}
		if redemption.ExpiredTime != 0 && redemption.ExpiredTime < now {
			return ErrRedemptionExpired
		}

		updateResult := tx.Model(&Token{}).
			Where("id = ? and user_id = ? and status <> ?", tokenId, userId, common.TokenStatusDisabled).
			Updates(map[string]interface{}{
				"remain_quota":  gorm.Expr("remain_quota + ?", redemption.Quota),
				"accessed_time": now,
			})
		err = updateResult.Error
		if err != nil {
			return err
		}
		if updateResult.RowsAffected == 0 {
			token := &Token{}
			tokenErr := tx.Where("id = ? and user_id = ?", tokenId, userId).First(token).Error
			if errors.Is(tokenErr, gorm.ErrRecordNotFound) {
				return ErrRedeemTokenNotFound
			}
			if tokenErr != nil {
				return tokenErr
			}
			if token.Status == common.TokenStatusDisabled {
				return ErrRedeemTokenDisabled
			}
			return ErrRedeemFailed
		}
		err = tx.Model(&Token{}).
			Where("id = ? and user_id = ? and status = ?", tokenId, userId, common.TokenStatusExhausted).
			Update("status", common.TokenStatusEnabled).Error
		if err != nil {
			return err
		}

		redemption.RedeemedTime = now
		redemption.Status = common.RedemptionCodeStatusUsed
		redemption.UsedUserId = userId
		redemption.RedeemedTokenId = tokenId
		redemption.RedeemedTokenKeyHash = hashedTokenKey
		redemption.RedeemedIP = clientIP
		redemption.RedeemedUA = userAgent
		err = tx.Save(redemption).Error
		return err
	})
	if err != nil {
		if errors.Is(err, ErrRedemptionInvalid) || errors.Is(err, ErrRedemptionUsed) || errors.Is(err, ErrRedemptionExpired) {
			return 0, err
		}
		if errors.Is(err, ErrRedeemTokenNotFound) || errors.Is(err, ErrRedeemTokenDisabled) {
			return 0, err
		}
		common.SysError("token coupon redemption failed: " + err.Error())
		return 0, ErrRedeemFailed
	}
	if _, getTokenErr := GetTokenById(tokenId); getTokenErr != nil {
		common.SysError("failed to refresh token cache after coupon redemption: " + getTokenErr.Error())
	}
	RecordLog(userId, LogTypeTopup, fmt.Sprintf("API Key 通过优惠券充值 %s，令牌ID %d，兑换码ID %d", logger.LogQuota(redemption.Quota), tokenId, redemption.Id))
	return redemption.Quota, nil
}

func (redemption *Redemption) Insert() error {
	var err error
	err = DB.Create(redemption).Error
	return err
}

func (redemption *Redemption) SelectUpdate() error {
	// This can update zero values
	return DB.Model(redemption).Select("redeemed_time", "status").Updates(redemption).Error
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (redemption *Redemption) Update() error {
	var err error
	err = DB.Model(redemption).Select("name", "status", "target_type", "quota", "redeemed_time", "expired_time").Updates(redemption).Error
	return err
}

func (redemption *Redemption) Delete() error {
	var err error
	err = DB.Delete(redemption).Error
	return err
}

func DeleteRedemptionById(id int) (err error) {
	if id == 0 {
		return errors.New("id 为空！")
	}
	redemption := Redemption{Id: id}
	err = DB.Where(redemption).First(&redemption).Error
	if err != nil {
		return err
	}
	return redemption.Delete()
}

func DeleteInvalidRedemptions() (int64, error) {
	now := common.GetTimestamp()
	result := DB.Where("status IN ? OR (status = ? AND expired_time != 0 AND expired_time < ?)", []int{common.RedemptionCodeStatusUsed, common.RedemptionCodeStatusDisabled}, common.RedemptionCodeStatusEnabled, now).Delete(&Redemption{})
	return result.RowsAffected, result.Error
}
