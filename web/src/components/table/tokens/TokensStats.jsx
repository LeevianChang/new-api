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
import { Card, Typography } from '@douyinfe/semi-ui';
import { Key, Activity, Shield } from 'lucide-react';

const { Title, Text } = Typography;

const TokensStats = ({ tokenCount, t }) => {
  return (
    <div className='grid grid-cols-12 gap-4 mb-6'>
      {/* Active Tokens Card */}
      <Card
        className='col-span-12 md:col-span-4 !bg-opacity-60 backdrop-blur-xl !border-opacity-15 relative overflow-hidden group'
        style={{
          background: 'rgba(18, 19, 25, 0.6)',
          boxShadow: 'inset 0 0 0 1px rgba(143, 245, 255, 0.15)',
        }}
      >
        <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity'>
          <Key size={60} className='text-cyan-400' />
        </div>
        <Text
          type='tertiary'
          className='!text-xs !uppercase !tracking-widest !mb-1'
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {t('活跃令牌')}
        </Text>
        <div className='flex items-baseline gap-2'>
          <Title
            heading={3}
            className='!text-3xl !font-bold !text-cyan-400'
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {tokenCount || 0}
          </Title>
        </div>
      </Card>
    </div>
  );
};

export default TokensStats;
