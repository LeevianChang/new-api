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
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { PieChart } from 'lucide-react';
import { VChart } from '@visactor/react-vchart';

const ChartsPanel = ({
  activeChartTab,
  setActiveChartTab,
  spec_line,
  spec_model_line,
  spec_pie,
  spec_rank_bar,
  CARD_PROPS,
  CHART_CONFIG,
  FLEX_CENTER_GAP2,
  hasApiInfoPanel,
  t,
}) => {
  return (
    <div className={`aether-glass-panel rounded-xl relative overflow-hidden ${hasApiInfoPanel ? 'lg:col-span-3' : ''}`}>
      <div className='p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-3 mb-8'>
          <div className='flex items-center gap-2'>
            <PieChart size={20} className='text-aether-primary' />
            <h3 className='font-aether-headline text-xl font-bold tracking-tight'>
              {t('模型数据分析')}
            </h3>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setActiveChartTab('1')}
              className={`px-3 py-1 text-[10px] font-aether-label rounded-md transition-all ${
                activeChartTab === '1'
                  ? 'bg-aether-primary/20 border border-aether-primary/30 text-aether-primary'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }`}
            >
              {t('消耗分布')}
            </button>
            <button
              onClick={() => setActiveChartTab('2')}
              className={`px-3 py-1 text-[10px] font-aether-label rounded-md transition-all ${
                activeChartTab === '2'
                  ? 'bg-aether-primary/20 border border-aether-primary/30 text-aether-primary'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }`}
            >
              {t('消耗趋势')}
            </button>
            <button
              onClick={() => setActiveChartTab('3')}
              className={`px-3 py-1 text-[10px] font-aether-label rounded-md transition-all ${
                activeChartTab === '3'
                  ? 'bg-aether-primary/20 border border-aether-primary/30 text-aether-primary'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }`}
            >
              {t('调用次数分布')}
            </button>
            <button
              onClick={() => setActiveChartTab('4')}
              className={`px-3 py-1 text-[10px] font-aether-label rounded-md transition-all ${
                activeChartTab === '4'
                  ? 'bg-aether-primary/20 border border-aether-primary/30 text-aether-primary'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }`}
            >
              {t('调用次数排行')}
            </button>
          </div>
        </div>
        <div className='h-64'>
          {activeChartTab === '1' && (
            <VChart spec={spec_line} option={CHART_CONFIG} />
          )}
          {activeChartTab === '2' && (
            <VChart spec={spec_model_line} option={CHART_CONFIG} />
          )}
          {activeChartTab === '3' && (
            <VChart spec={spec_pie} option={CHART_CONFIG} />
          )}
          {activeChartTab === '4' && (
            <VChart spec={spec_rank_bar} option={CHART_CONFIG} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsPanel;
