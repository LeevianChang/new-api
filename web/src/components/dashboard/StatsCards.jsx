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
import { Card, Avatar, Skeleton, Tag } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCards = ({
  groupedStatsData,
  loading,
  getTrendSpec,
  CARD_PROPS,
  CHART_CONFIG,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const borderColors = [
    '#FF716C',
    '#aa8aff',
    '#ff59e3',
    '#8ff5ff',
  ];

  const textColors = [
    'text-[#FF716C]',
    'text-aether-secondary',
    'text-aether-tertiary',
    'text-aether-primary',
  ];

  const labelColors = [
    'text-[#FF716C]/70',
    'text-aether-secondary/70',
    'text-aether-tertiary/70',
    'text-aether-primary/70',
  ];

  return (
    <div className='mb-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {groupedStatsData.map((group, idx) => (
          <div
            key={idx}
            className='aether-glass-panel p-5 rounded-xl group hover:bg-aether-surface-container-high transition-all'
            style={{ 
              borderLeft: `3px solid ${borderColors[idx % borderColors.length]}`
            }}
          >
            <div className='space-y-4'>
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className='cursor-pointer'
                  onClick={item.onClick}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-3 flex-1'>
                      <div className={`p-2 rounded-lg ${
                        idx === 0 ? 'bg-[#FF716C]/10 text-[#FF716C]' :
                        idx === 1 ? 'bg-aether-secondary/10 text-aether-secondary' :
                        idx === 2 ? 'bg-aether-tertiary/10 text-aether-tertiary' :
                        'bg-aether-primary/10 text-aether-primary'
                      }`}>
                        {item.icon}
                      </div>
                      <div className='flex-1'>
                        <div className={`text-xs font-aether-label uppercase mb-1 ${labelColors[idx % labelColors.length]}`}>
                          {item.title}
                        </div>
                        <div className={`font-aether-headline text-3xl font-bold ${textColors[idx % textColors.length]}`}>
                          <Skeleton
                            loading={loading}
                            active
                            placeholder={
                              <Skeleton.Paragraph
                                active
                                rows={1}
                                style={{
                                  width: '100px',
                                  height: '32px',
                                  marginTop: '4px',
                                }}
                              />
                            }
                          >
                            {item.value}
                          </Skeleton>
                        </div>
                        {item.title === t('当前余额') && (
                          <div 
                            className={`flex items-center gap-1 text-xs font-aether-label mt-1 ${textColors[idx % textColors.length]} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => navigate('/console/topup')}
                          >
                            <TrendingUp size={14} />
                            <span className='uppercase'>{t('充值')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.title !== t('当前余额') && (loading || (item.trendData && item.trendData.length > 0)) && (
                      <div className='h-12 w-20 bg-white/5 rounded-sm overflow-hidden flex-shrink-0'>
                        <VChart
                          spec={getTrendSpec(item.trendData, item.trendColor)}
                          option={CHART_CONFIG}
                          className='aether-sparkline'
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
