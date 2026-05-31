package model

import (
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRedeemForTokenSubscriptionPackDoesNotShortenExpiry(t *testing.T) {
	truncateTables(t)

	now := common.GetTimestamp()
	user := &User{Username: "redeem_pack_user", Password: "password123", Status: common.UserStatusEnabled, Group: "default"}
	require.NoError(t, DB.Create(user).Error)

	token := &Token{
		UserId:      user.Id,
		Key:         "test-token-key",
		Type:        TokenTypeSubscription,
		Status:      common.TokenStatusEnabled,
		ExpiredTime: now + int64(30*24*time.Hour/time.Second),
		RemainQuota: 100,
	}
	require.NoError(t, DB.Create(token).Error)

	redemption := &Redemption{
		Key:              "redeem-pack-code",
		Status:           common.RedemptionCodeStatusEnabled,
		TargetType:       RedemptionTargetTypeTokenSubscription,
		SubscriptionType: RedemptionSubscriptionTypePack,
		RenewalDays:      7,
		Quota:            50,
	}
	require.NoError(t, DB.Create(redemption).Error)

	quota, err := RedeemForToken(redemption.Key, user.Id, token.Id, token.Key, "127.0.0.1", "test")
	require.NoError(t, err)
	assert.Equal(t, redemption.Quota, quota)

	var reloaded Token
	require.NoError(t, DB.First(&reloaded, token.Id).Error)
	assert.Equal(t, token.ExpiredTime, reloaded.ExpiredTime)
	assert.Equal(t, token.RemainQuota+redemption.Quota, reloaded.RemainQuota)
}

func TestRedeemForBalanceTokenUsesRedemptionRenewalDays(t *testing.T) {
	truncateTables(t)

	now := common.GetTimestamp()
	user := &User{Username: "redeem_balance_user", Password: "password123", Status: common.UserStatusEnabled, Group: "default"}
	require.NoError(t, DB.Create(user).Error)

	token := &Token{
		UserId:      user.Id,
		Key:         "test-balance-token-key",
		Type:        TokenTypeBalance,
		Status:      common.TokenStatusEnabled,
		ExpiredTime: now + int64(24*time.Hour/time.Second),
		RemainQuota: 100,
	}
	require.NoError(t, DB.Create(token).Error)

	redemption := &Redemption{
		Key:         "redeem-balance-code",
		Status:      common.RedemptionCodeStatusEnabled,
		TargetType:  RedemptionTargetTypeToken,
		RenewalDays: 7,
		Quota:       50,
	}
	require.NoError(t, DB.Create(redemption).Error)

	quota, err := RedeemForToken(redemption.Key, user.Id, token.Id, token.Key, "127.0.0.1", "test")
	require.NoError(t, err)
	assert.Equal(t, redemption.Quota, quota)

	var reloaded Token
	require.NoError(t, DB.First(&reloaded, token.Id).Error)
	assert.InDelta(t, now+int64(7*24*time.Hour/time.Second), reloaded.ExpiredTime, 2)
	assert.Equal(t, token.RemainQuota+redemption.Quota, reloaded.RemainQuota)
}
