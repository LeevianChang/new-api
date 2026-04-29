package middleware

import (
	"errors"
	"fmt"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

func abortWithOpenAiMessage(c *gin.Context, statusCode int, message string, code ...types.ErrorCode) {
	codeStr := ""
	if len(code) > 0 {
		codeStr = string(code[0])
	}
	apiErr := types.NewErrorWithStatusCode(errors.New(message), types.ErrorCode(codeStr), statusCode, types.ErrOptionWithSkipRetry())
	service.ApplySystemErrorMessage(apiErr)
	message = apiErr.Error()
	codeStr = string(apiErr.GetErrorCode())
	if apiErr.GetErrorCode() == types.ErrorCodeGetChannelFailed {
		message = service.AppendGetChannelFailedModelMessage(message, common.GetContextKeyString(c, constant.ContextKeyOriginalModel))
		apiErr.SetMessage(message)
	}
	userId := c.GetInt("id")
	maskedSubmittedKey := ""
	if isTokenAuthErrorCode(codeStr) {
		maskedSubmittedKey = common.GetContextKeyString(c, constant.ContextKeySubmittedTokenKey)
		if maskedSubmittedKey != "" {
			message = fmt.Sprintf("%s，当前使用的Key是：%s", message, maskedSubmittedKey)
		}
	}
	errorPayload := gin.H{
		"message": common.MessageWithRequestId(message, c.GetString(common.RequestIdKey)),
		"type":    "new_api_error",
		"code":    codeStr,
	}
	c.JSON(statusCode, gin.H{
		"error": errorPayload,
	})
	c.Abort()
	logger.LogError(c.Request.Context(), fmt.Sprintf("user %d | code=%s | %s", userId, codeStr, message))
}

func isTokenAuthErrorCode(code string) bool {
	switch code {
	case "token_missing", "token_invalid", "token_expired", "token_exhausted", "token_disabled", "token_auth_failed":
		return true
	default:
		return false
	}
}

func abortWithMidjourneyMessage(c *gin.Context, statusCode int, code int, description string) {
	c.JSON(statusCode, gin.H{
		"description": description,
		"type":        "new_api_error",
		"code":        code,
	})
	c.Abort()
	logger.LogError(c.Request.Context(), description)
}
