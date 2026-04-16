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

import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { Zap, Copy } from 'lucide-react';

const InvitationCard = ({
  t,
  userState,
  renderQuota,
  setOpenTransfer,
  affLink,
  handleAffLinkClick,
}) => {
  return (
    <div className='space-y-8'>
      {/* Earnings Stats Card */}
      <div 
        className='backdrop-blur-xl rounded-xl p-8 relative overflow-hidden group'
        style={{
          background: 'rgba(18, 19, 25, 0.6)',
          border: '1px solid rgba(143, 245, 255, 0.05)'
        }}
      >
        <div className='absolute top-0 left-0 w-32 h-32 bg-secondary/5 blur-3xl group-hover:bg-secondary/10 transition-colors'></div>
        <div className='relative z-10'>
          <div className='flex justify-between items-center mb-6'>
            <div className='text-sm font-space-grotesk font-bold uppercase tracking-widest' style={{ color: '#aa8aff' }}>
              {t('收益统计')}
            </div>
            <Button
              type='primary'
              theme='solid'
              size='small'
              disabled={
                !userState?.user?.aff_quota ||
                userState?.user?.aff_quota <= 0
              }
              onClick={() => setOpenTransfer(true)}
              className='!rounded-lg'
              style={{
                backgroundColor: '#aa8aff',
                borderColor: '#aa8aff',
                color: '#0d0e13',
              }}
            >
              <Zap size={12} className='mr-1' />
              {t('划转到余额')}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-3 gap-6'>
            {/* Pending */}
            <div className='space-y-2'>
              <p className='text-xs font-space-grotesk uppercase tracking-tighter' style={{ color: 'rgb(71, 71, 78)' }}>
                {t('待使用收益')}
              </p>
              <div className='text-3xl font-space-grotesk font-bold' style={{ color: '#844eff' }}>
                {renderQuota(userState?.user?.aff_quota || 0)}
              </div>
            </div>

            {/* Total Earnings */}
            <div className='space-y-2'>
              <p className='text-xs font-space-grotesk uppercase tracking-tighter' style={{ color: 'rgb(71, 71, 78)' }}>
                {t('总收益')}
              </p>
              <div className='text-3xl font-space-grotesk font-bold text-on-surface'>
                {renderQuota(userState?.user?.aff_history_quota || 0)}
              </div>
            </div>

            {/* Invited */}
            <div className='space-y-2'>
              <p className='text-xs font-space-grotesk uppercase tracking-tighter' style={{ color: 'rgb(71, 71, 78)' }}>
                {t('邀请人数')}
              </p>
              <div className='text-3xl font-space-grotesk font-bold text-on-surface'>
                {userState?.user?.aff_count || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Link Section */}
      <div className='space-y-4'>
        <label 
          className='block text-xs font-space-grotesk uppercase tracking-widest'
          style={{ color: 'rgb(170, 138, 255)' }}
        >
          {t('邀请链接')}
        </label>
        <div 
          className='rounded-xl p-4 flex items-center justify-between border transition-colors'
          style={{
            backgroundColor: 'rgb(30, 31, 38)',
            borderColor: 'rgba(170, 138, 255, 0.3)',
          }}
        >
          <code 
            className='text-sm font-label overflow-hidden text-ellipsis whitespace-nowrap'
            style={{ color: 'rgb(171, 170, 177)' }}
          >
            {affLink}
          </code>
          <button
            onClick={handleAffLinkClick}
            className='flex items-center gap-2 transition-colors font-space-grotesk text-xs uppercase font-bold pl-4'
            style={{ color: 'rgb(170, 138, 255)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgb(200, 180, 255)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgb(170, 138, 255)';
            }}
          >
            <Copy size={16} />
            <span>{t('复制')}</span>
          </button>
        </div>
      </div>

      {/* Protocol Rewards */}
      <div 
        className='backdrop-blur-xl rounded-xl p-8 space-y-6'
        style={{
          background: 'rgba(18, 19, 25, 0.6)',
          border: '1px solid rgba(143, 245, 255, 0.05)'
        }}
      >
        <h3 className='text-sm font-space-grotesk font-bold uppercase tracking-widest text-on-surface'>
          {t('奖励说明')}
        </h3>
        <ul className='space-y-4'>
          <li className='flex items-start gap-3'>
            <div 
              className='mt-1 w-1.5 h-1.5 rounded-full'
              style={{ backgroundColor: 'rgb(170, 138, 255)' }}
            ></div>
            <p 
              className='text-sm leading-relaxed'
              style={{ color: 'rgb(171, 170, 177)' }}
            >
              {t('邀请好友注册，好友充值后您可获得相应奖励')}
            </p>
          </li>
          <li className='flex items-start gap-3'>
            <div 
              className='mt-1 w-1.5 h-1.5 rounded-full'
              style={{ backgroundColor: 'rgb(170, 138, 255)' }}
            ></div>
            <p 
              className='text-sm leading-relaxed'
              style={{ color: 'rgb(171, 170, 177)' }}
            >
              {t('通过划转功能将奖励额度转入到您的账户余额中')}
            </p>
          </li>
          <li className='flex items-start gap-3'>
            <div 
              className='mt-1 w-1.5 h-1.5 rounded-full'
              style={{ backgroundColor: 'rgb(170, 138, 255)' }}
            ></div>
            <p 
              className='text-sm leading-relaxed'
              style={{ color: 'rgb(171, 170, 177)' }}
            >
              {t('邀请的好友越多，获得的奖励越多')}
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InvitationCard;
