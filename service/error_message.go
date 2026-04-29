package service

import (
	"strconv"
	"strings"
	"sync"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/error_setting"
	"github.com/QuantumNous/new-api/setting/system_error_setting"
	"github.com/QuantumNous/new-api/types"
)

type cachedErrorMessageMapping struct {
	channelMapping *ErrorMessageMapping
	flatMapping    map[string]string
}

var channelErrorMessageMappingCache sync.Map

func AppendGetChannelFailedModelMessage(message string, modelName string) string {
	message = strings.TrimSpace(message)
	modelName = strings.TrimSpace(modelName)
	if modelName == "" {
		return message
	}
	if message == "" {
		return "当前使用的模型为：" + modelName + "。"
	}
	if !strings.HasSuffix(message, "。") && !strings.HasSuffix(message, ".") && !strings.HasSuffix(message, "！") && !strings.HasSuffix(message, "!") && !strings.HasSuffix(message, "？") && !strings.HasSuffix(message, "?") {
		message += "。"
	}
	return message + "当前使用的模型为：" + modelName + "。"
}

// ErrorMessageMapping 错误文案映射配置
type ErrorMessageMapping struct {
	DefaultMessage    string            `json:"default_message"`     // 默认错误文案
	ErrorCodeMapping  map[string]string `json:"error_code_mapping"`  // 错误码到错误文案的映射
	StatusCodeMapping map[string]string `json:"status_code_mapping"` // 状态码到错误文案的映射
}

func getChannelErrorMessage(channelErrorMessageMappingStr string, statusCode int, errorCode string) string {
	if channelErrorMessageMappingStr == "" || channelErrorMessageMappingStr == "{}" {
		return ""
	}

	codeStr := strconv.Itoa(statusCode)
	parsed := parseChannelErrorMessageMapping(channelErrorMessageMappingStr)
	if parsed.channelMapping != nil {
		channelMapping := parsed.channelMapping
		if errorCode != "" {
			if msg, ok := channelMapping.ErrorCodeMapping[errorCode]; ok && msg != "" {
				return msg
			}
		}
		if msg, ok := channelMapping.StatusCodeMapping[codeStr]; ok && msg != "" {
			return msg
		}
		if channelMapping.DefaultMessage != "" {
			return channelMapping.DefaultMessage
		}
	}

	// Compatibility: allow channel config like {"503":"message"} as status-code mapping.
	if parsed.flatMapping != nil {
		return parsed.flatMapping[codeStr]
	}

	return ""
}

func parseChannelErrorMessageMapping(channelErrorMessageMappingStr string) *cachedErrorMessageMapping {
	if value, ok := channelErrorMessageMappingCache.Load(channelErrorMessageMappingStr); ok {
		return value.(*cachedErrorMessageMapping)
	}

	parsed := &cachedErrorMessageMapping{}
	var channelMapping ErrorMessageMapping
	if err := common.Unmarshal([]byte(channelErrorMessageMappingStr), &channelMapping); err == nil {
		parsed.channelMapping = &channelMapping
	}

	flatStatusMapping := make(map[string]string)
	if err := common.Unmarshal([]byte(channelErrorMessageMappingStr), &flatStatusMapping); err == nil {
		parsed.flatMapping = flatStatusMapping
	}

	actual, _ := channelErrorMessageMappingCache.LoadOrStore(channelErrorMessageMappingStr, parsed)
	return actual.(*cachedErrorMessageMapping)
}

// ApplyErrorMessage 应用错误文案映射
// 优先级：Channel 状态码映射 > Channel 默认文案 > 全局状态码映射 > 全局默认文案
func ApplyErrorMessage(newApiErr *types.NewAPIError, channelErrorMessageMappingStr string) {
	if newApiErr == nil {
		return
	}

	statusCode := newApiErr.StatusCode
	errorCode := string(newApiErr.GetErrorCode())
	var message string

	// 1. 尝试从 Channel 配置获取错误文案
	message = getChannelErrorMessage(channelErrorMessageMappingStr, statusCode, errorCode)

	// 2. 如果 Channel 没有配置，尝试从全局配置获取
	if message == "" {
		// 2.1 尝试从全局状态码映射获取
		globalMsg := error_setting.GetMessageByStatusCode(statusCode)
		if globalMsg != "" {
			message = globalMsg
		} else {
			// 2.2 使用全局默认文案
			message = error_setting.GetDefaultMessage()
		}
	}
	if message == "" {
		message = newApiErr.Error()
	}
	if message == "" {
		message = errorCode
	}

	// 3. 应用错误文案
	if message != "" {
		newApiErr.SetMessage(message)
	}
}

// ApplySystemErrorMessage applies message mapping for system-generated errors only.
// Priority: channel error code > channel status code > channel default > global error code > global status code > global default.
func ApplySystemErrorMessage(newApiErr *types.NewAPIError, channelErrorMessageMappingStr ...string) {
	if newApiErr == nil || newApiErr.GetErrorType() != types.ErrorTypeNewAPIError {
		return
	}

	statusCode := newApiErr.StatusCode
	errorCode := string(newApiErr.GetErrorCode())
	var message string

	if len(channelErrorMessageMappingStr) > 0 {
		message = getChannelErrorMessage(channelErrorMessageMappingStr[0], statusCode, errorCode)
	}

	if message == "" {
		message = system_error_setting.GetMessageByErrorCode(errorCode)
	}
	if message == "" {
		message = system_error_setting.GetMessageByStatusCode(statusCode)
	}
	if message == "" {
		message = system_error_setting.GetDefaultMessage()
	}
	if message == "" {
		message = newApiErr.Error()
	}
	if message == "" {
		message = errorCode
	}
	if message != "" {
		newApiErr.SetMessage(message)
	}
}
