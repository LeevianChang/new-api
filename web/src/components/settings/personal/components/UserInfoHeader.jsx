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
import {
  Avatar,
  Card,
  Tag,
  Divider,
  Typography,
  Badge,
} from '@douyinfe/semi-ui';
import {
  isRoot,
  isAdmin,
  renderQuota,
  stringToColor,
} from '../../../../helpers';
import { Coins, BarChart2, Users, Activity } from 'lucide-react';

const UserInfoHeader = ({ t, userState }) => {
  const getUsername = () => {
    if (userState.user) {
      return userState.user.username;
    } else {
      return 'null';
    }
  };

  const getAvatarText = () => {
    const username = getUsername();
    if (username && username.length > 0) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'NA';
  };

  const getRoleTag = () => {
    if (isRoot()) {
      return { text: t('超级管理员'), color: '#ff59e3', label: 'SUPERUSER' };
    } else if (isAdmin()) {
      return { text: t('管理员'), color: '#aa8aff', label: 'ADMIN' };
    } else {
      return { text: t('普通用户'), color: '#8ff5ff', label: 'USER' };
    }
  };

  const roleInfo = getRoleTag();

  return (
    <div className='relative overflow-hidden' style={{ 
      background: 'rgba(18, 19, 25, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(143, 245, 255, 0.05)',
      borderRadius: '24px',
    }}>
      {/* Header Section with Avatar */}
      <div className='relative p-8 overflow-hidden' style={{
        background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1) 0%, transparent 100%)',
      }}>
        <div className='flex flex-col md:flex-row items-center md:items-end gap-6'>
          {/* Avatar with Glow Effect */}
          <div className='relative group'>
            <div className='absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000' style={{
              background: 'linear-gradient(90deg, #8ff5ff, #aa8aff)',
            }}></div>
            <div className='relative'>
              <Avatar 
                size='extra-large' 
                color={stringToColor(getUsername())}
                style={{
                  width: '120px',
                  height: '120px',
                  fontSize: '48px',
                  border: '2px solid rgba(143, 245, 255, 0.5)',
                }}
              >
                {getAvatarText()}
              </Avatar>
              <div className='absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider' style={{
                background: '#8ff5ff',
                color: '#005d63',
              }}>
                ID: {userState?.user?.id}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className='flex-1 text-center md:text-left'>
            <div className='flex items-center justify-center md:justify-start gap-3 mb-2'>
              <h1 className='text-4xl md:text-5xl font-bold tracking-tighter' style={{
                color: '#8ff5ff',
                textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {getUsername()}
              </h1>
              <span className='px-3 py-1 rounded text-xs font-bold tracking-widest' style={{
                background: `${roleInfo.color}20`,
                color: roleInfo.color,
                border: `1px solid ${roleInfo.color}30`,
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {roleInfo.label}
              </span>
            </div>
            <p className='text-sm mb-6 uppercase tracking-widest' style={{
              color: '#abaab1',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              {t('访问级别')}: {roleInfo.text}
            </p>

            {/* Balance Card */}
            <div className='inline-block p-6 rounded-xl min-w-[280px]' style={{
              background: 'rgba(18, 19, 25, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(143, 245, 255, 0.05)',
            }}>
              <p className='text-xs uppercase tracking-widest mb-1' style={{
                color: '#75757b',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {t('可用余额')}
              </p>
              <div className='text-4xl font-bold mb-4' style={{
                color: '#8ff5ff',
                textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {renderQuota(userState?.user?.quota)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-6'>
        {/* Historical Usage */}
        <div className='p-4 rounded-xl transition-all hover:translate-y-[-2px]' style={{
          background: 'rgba(24, 25, 32, 0.6)',
          border: '1px solid rgba(143, 245, 255, 0.1)',
        }}>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-full flex items-center justify-center' style={{
              background: 'rgba(143, 245, 255, 0.1)',
            }}>
              <Coins size={20} style={{ color: '#8ff5ff' }} />
            </div>
            <div>
              <p className='text-xs uppercase tracking-widest' style={{
                color: '#75757b',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {t('历史消耗')}
              </p>
              <p className='text-lg font-bold' style={{
                color: '#8ff5ff',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {renderQuota(userState?.user?.used_quota)}
              </p>
            </div>
          </div>
        </div>

        {/* Request Count */}
        <div className='p-4 rounded-xl transition-all hover:translate-y-[-2px]' style={{
          background: 'rgba(24, 25, 32, 0.6)',
          border: '1px solid rgba(170, 138, 255, 0.1)',
        }}>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-full flex items-center justify-center' style={{
              background: 'rgba(170, 138, 255, 0.1)',
            }}>
              <BarChart2 size={20} style={{ color: '#aa8aff' }} />
            </div>
            <div>
              <p className='text-xs uppercase tracking-widest' style={{
                color: '#75757b',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {t('请求次数')}
              </p>
              <p className='text-lg font-bold' style={{
                color: '#aa8aff',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {userState.user?.request_count || 0}
              </p>
            </div>
          </div>
        </div>

        {/* User Group */}
        <div className='p-4 rounded-xl transition-all hover:translate-y-[-2px]' style={{
          background: 'rgba(24, 25, 32, 0.6)',
          border: '1px solid rgba(255, 89, 227, 0.1)',
        }}>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-full flex items-center justify-center' style={{
              background: 'rgba(255, 89, 227, 0.1)',
            }}>
              <Users size={20} style={{ color: '#ff59e3' }} />
            </div>
            <div>
              <p className='text-xs uppercase tracking-widest' style={{
                color: '#75757b',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {t('用户分组')}
              </p>
              <p className='text-lg font-bold' style={{
                color: '#ff59e3',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {userState?.user?.group || t('默认')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoHeader;
