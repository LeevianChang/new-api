package error_setting

import (
	"strconv"
	"strings"
	"sync"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/config"
)

// ErrorMessageConfig 全局错误文案配置
type ErrorMessageConfig struct {
	DefaultMessage    string            `json:"default_message"`     // 默认错误文案
	StatusCodeMapping map[string]string `json:"status_code_mapping"` // 状态码到错误文案的映射
	mutex             sync.RWMutex      `json:"-"`
}

var globalErrorConfig = &ErrorMessageConfig{
	DefaultMessage:    "请求处理失败",
	StatusCodeMapping: make(map[string]string),
}

func init() {
	// 注册到全局配置管理器
	config.GlobalConfig.Register("error_setting", globalErrorConfig)
}

// GetDefaultMessage 获取默认错误文案
func GetDefaultMessage() string {
	globalErrorConfig.mutex.RLock()
	defer globalErrorConfig.mutex.RUnlock()
	return globalErrorConfig.DefaultMessage
}

// GetMessageByStatusCode 根据状态码获取错误文案
func GetMessageByStatusCode(statusCode int) string {
	globalErrorConfig.mutex.RLock()
	defer globalErrorConfig.mutex.RUnlock()

	codeStr := strconv.Itoa(statusCode)
	if msg, ok := globalErrorConfig.StatusCodeMapping[codeStr]; ok {
		return msg
	}
	return ""
}

func (c *ErrorMessageConfig) UpdateFromMap(configMap map[string]string) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	if value, ok := configMap["default_message"]; ok {
		c.DefaultMessage = value
	}
	if value, ok := configMap["status_code_mapping"]; ok {
		if strings.TrimSpace(value) == "" {
			c.StatusCodeMapping = nil
			return nil
		}
		mapping := make(map[string]string)
		if err := common.Unmarshal([]byte(value), &mapping); err != nil {
			return nil
		}
		c.StatusCodeMapping = mapping
	}
	return nil
}

func (c *ErrorMessageConfig) ExportMap() (map[string]string, error) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	statusCodeMapping, err := common.Marshal(c.StatusCodeMapping)
	if err != nil {
		return nil, err
	}
	return map[string]string{
		"default_message":     c.DefaultMessage,
		"status_code_mapping": string(statusCodeMapping),
	}, nil
}

// SetDefaultMessage 设置默认错误文案（用于测试）
func SetDefaultMessage(msg string) {
	globalErrorConfig.mutex.Lock()
	defer globalErrorConfig.mutex.Unlock()
	globalErrorConfig.DefaultMessage = msg
}

// SetStatusCodeMapping 设置状态码映射（用于测试）
func SetStatusCodeMapping(mapping map[string]string) {
	globalErrorConfig.mutex.Lock()
	defer globalErrorConfig.mutex.Unlock()
	globalErrorConfig.StatusCodeMapping = mapping
}
