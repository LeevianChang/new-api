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
import { Tag, Empty } from '@douyinfe/semi-ui';
import { Server, Gauge, ExternalLink, Copy } from 'lucide-react';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const ApiInfoPanel = ({
  apiInfoData,
  handleCopyUrl,
  handleSpeedTest,
  CARD_PROPS,
  FLEX_CENTER_GAP2,
  ILLUSTRATION_SIZE,
  t,
}) => {
  return (
    <div className='aether-glass-panel rounded-xl overflow-hidden flex flex-col'>
      <div className='p-6 bg-aether-primary/5 border-b border-white/5'>
        <h3 className='font-aether-headline text-lg font-bold tracking-tight flex items-center gap-2'>
          <Server size={18} className='text-aether-primary' />
          {t('API信息')}
        </h3>
      </div>
      <div className='p-6 flex-1 flex flex-col'>
        <ScrollableContainer maxHeight='20rem'>
          {apiInfoData.length > 0 ? (
            <div className='space-y-4'>
              {apiInfoData.map((api) => (
                <div key={api.id} className='space-y-1'>
                  <label className='text-[10px] font-aether-label text-slate-500 uppercase tracking-widest'>
                    {api.route}
                  </label>
                  <div className='flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5'>
                    <span className='font-mono text-xs text-aether-primary truncate flex-1'>
                      {api.url}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(api.url)}
                      className='text-sm text-slate-500 hover:text-aether-primary transition-all'
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className='flex items-center justify-between text-xs font-aether-body py-1'>
                    <span className='text-slate-400'>{api.description}</span>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => handleSpeedTest(api.url)}
                        className='text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all'
                      >
                        {t('测速')}
                      </button>
                      <button
                        onClick={() => window.open(api.url, '_blank', 'noopener,noreferrer')}
                        className='text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all'
                      >
                        {t('跳转')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex justify-center items-center min-h-[20rem] w-full'>
              <Empty
                image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
                darkModeImage={
                  <IllustrationConstructionDark style={ILLUSTRATION_SIZE} />
                }
                title={t('暂无API信息')}
                description={t('请联系管理员在系统设置中配置API信息')}
              />
            </div>
          )}
        </ScrollableContainer>
      </div>
    </div>
  );
};

export default ApiInfoPanel;
