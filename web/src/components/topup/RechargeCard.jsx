/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useState } from 'react';
import { Button, Toast } from '@douyinfe/semi-ui';
import { Wallet, AlertTriangle } from 'lucide-react';
import { showError, showSuccess } from '../../helpers';

const RechargeCard = ({
  t,
  userState,
  renderQuota,
  redemptionCode,
  setRedemptionCode,
  topUp,
  isSubmitting,
  topUpLink,
  openTopUpLink,
}) => {
  return (
    <div className='space-y-8'>
      {/* Account Stats Card */}
      <div 
        className='backdrop-blur-xl rounded-xl p-8 relative overflow-hidden group'
        style={{
          background: 'rgba(18, 19, 25, 0.6)',
          border: '1px solid rgba(143, 245, 255, 0.05)'
        }}
      >
        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors'></div>
        <div className='relative z-10'>
          <div className='grid grid-cols-3 gap-6'>
            {/* Current Balance */}
            <div className='space-y-2'>
              <p className='text-xs font-space-grotesk uppercase tracking-tighter' style={{ color: 'rgb(71, 71, 78)' }}>
                {t('当前余额')}
              </p>
              <div className='text-3xl font-space-grotesk font-bold' style={{ color: '#8ff5ff' }}>
                {renderQuota(userState?.user?.quota)}
              </div>
            </div>

            {/* History */}
            <div className='space-y-2'>
              <p className='text-xs font-space-grotesk uppercase tracking-tighter' style={{ color: 'rgb(71, 71, 78)' }}>
                {t('历史消耗')}
              </p>
              <div className='text-3xl font-space-grotesk font-bold text-on-surface'>
                {renderQuota(userState?.user?.used_quota)}
              </div>
            </div>

            {/* Requests */}
            <div className='space-y-2'>
              <p className='text-xs font-space-grotesk uppercase tracking-tighter' style={{ color: 'rgb(71, 71, 78)' }}>
                {t('请求次数')}
              </p>
              <div className='text-3xl font-space-grotesk font-bold' style={{ color: '#aa8aff' }}>
                {userState?.user?.request_count || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice Banner */}
      <div 
        className='rounded-xl p-6 relative overflow-hidden'
        style={{ 
          backgroundColor: 'rgb(30, 31, 38)',
          borderLeft: '4px solid rgb(255 89 227 / 0.5)' 
        }}
      >
        <div className='flex gap-4 items-start'>
          <AlertTriangle 
            size={20}
            style={{ 
              flexShrink: 0,
              color: 'rgb(255, 89, 227)'
            }}
          />
          <p 
            className='text-sm leading-relaxed'
            style={{ color: 'rgb(171, 170, 177)' }}
          >
            {t('管理员未开启在线充值功能，请联系管理员开启或使用兑换码充值。')}
          </p>
        </div>
      </div>

      {/* Redeem Code Section */}
      <div className='space-y-4'>
        <label 
          className='block text-xs font-space-grotesk uppercase tracking-widest'
          style={{ color: 'rgb(0, 222, 236)' }}
        >
          {t('兑换码充值')}
        </label>
        <div className='flex gap-4'>
          <div className='relative flex-1 group'>
            <input
              className='w-full border rounded-xl px-4 py-4 text-on-surface font-label placeholder:text-outline transition-all focus:outline-none'
              placeholder={t('请输入兑换码')}
              type='text'
              value={redemptionCode}
              onChange={(e) => setRedemptionCode(e.target.value)}
              style={{
                backgroundColor: 'rgb(30, 31, 38)',
                borderColor: 'transparent',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgb(0, 222, 236)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
              }}
            />
          </div>
          <button
            onClick={topUp}
            disabled={isSubmitting}
            className='px-8 py-4 rounded-xl border font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95'
            style={{
              backgroundColor: 'rgb(30, 31, 38)',
              borderColor: 'rgb(0, 222, 236)',
              color: 'rgb(0, 222, 236)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = 'rgb(24, 25, 30)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgb(30, 31, 38)';
            }}
          >
            {isSubmitting ? t('兑换中...') : t('兑换额度')}
          </button>
        </div>
        {topUpLink && (
          <div className='text-xs text-on-surface-variant'>
            {t('在找兑换码？')}
            <span
              className='text-secondary cursor-pointer hover:text-primary transition-colors ml-2'
              onClick={openTopUpLink}
            >
              {t('购买兑换码')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeCard;
