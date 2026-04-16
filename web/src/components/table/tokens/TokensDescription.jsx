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
import { Typography } from '@douyinfe/semi-ui';
import CompactModeToggle from '../../common/ui/CompactModeToggle';

const { Text, Title } = Typography;

const TokensDescription = ({ compactMode, setCompactMode, t }) => {
  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full'>
      <div>
        <div className='flex items-end gap-3 mb-2'>
          <Title 
            heading={2} 
            className='!text-4xl !font-bold !tracking-tighter !mb-0'
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {t('令牌')}<span className='text-primary'>{t('管理')}</span>
          </Title>
          <div 
            className='relay-pulse w-2 h-2 rounded-full mb-1'
            style={{ backgroundColor: 'rgb(255, 89, 227)' }}
          ></div>
        </div>
        <Text 
          type='tertiary' 
          className='!text-sm max-w-lg'
        >
          {t('管理访问授权和资源配额。所有密钥均已加密存储，具有中继级隔离。')}
        </Text>
      </div>

      <CompactModeToggle
        compactMode={compactMode}
        setCompactMode={setCompactMode}
        t={t}
      />
    </div>
  );
};

export default TokensDescription;
