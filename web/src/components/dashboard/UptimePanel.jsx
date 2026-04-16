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
  Button,
  Spin,
  Tabs,
  TabPane,
  Tag,
  Empty,
} from '@douyinfe/semi-ui';
import { Gauge, RefreshCw } from 'lucide-react';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const UptimePanel = ({
  uptimeData,
  uptimeLoading,
  activeUptimeTab,
  setActiveUptimeTab,
  loadUptimeData,
  uptimeLegendData,
  renderMonitorList,
  CARD_PROPS,
  ILLUSTRATION_SIZE,
  t,
}) => {
  return (
    <div className='aether-glass-panel p-6 rounded-xl lg:col-span-1'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Gauge size={18} color='#ec4899' />
          <h3 className='font-aether-headline text-lg font-bold tracking-tight'>
            {t('服务可用性')}
          </h3>
        </div>
        <Button
          icon={<RefreshCw size={14} />}
          onClick={loadUptimeData}
          loading={uptimeLoading}
          size='small'
          theme='borderless'
          type='tertiary'
          className='text-gray-500 hover:text-pink-500 hover:bg-pink-50 !rounded-full'
        />
      </div>
      <div className='relative'>
        <Spin spinning={uptimeLoading}>
          {uptimeData.length > 0 ? (
            uptimeData.length === 1 ? (
              <ScrollableContainer maxHeight='24rem'>
                {renderMonitorList(uptimeData[0].monitors)}
              </ScrollableContainer>
            ) : (
              <div className='space-y-2'>
                <Tabs
                  type='line'
                  activeKey={activeUptimeTab}
                  onChange={setActiveUptimeTab}
                  size='small'
                  className='aether-tabs'
                >
                  {uptimeData.map((group, groupIdx) => (
                    <TabPane
                      tab={
                        <span className='flex items-center gap-2'>
                          <Gauge size={14} color='#ec4899' />
                          <span className='font-aether-body'>{group.categoryName}</span>
                          <span className='text-[10px] font-aether-label px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500'>
                            {group.monitors ? group.monitors.length : 0}
                          </span>
                        </span>
                      }
                      itemKey={group.categoryName}
                      key={groupIdx}
                    >
                      <ScrollableContainer maxHeight='21.5rem'>
                        {renderMonitorList(group.monitors)}
                      </ScrollableContainer>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            )
          ) : (
            <div className='flex justify-center items-center py-8'>
              <Empty
                image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
                darkModeImage={
                  <IllustrationConstructionDark style={ILLUSTRATION_SIZE} />
                }
                title={t('暂无监控数据')}
                description={t('请联系管理员在系统设置中配置Uptime')}
              />
            </div>
          )}
        </Spin>
      </div>

      {uptimeData.length > 0 && (
        <div className='mt-4 pt-4 border-t border-white/5'>
          <div className='flex flex-wrap gap-3 text-xs justify-center'>
            {uptimeLegendData.map((legend, index) => (
              <div key={index} className='flex items-center gap-1.5'>
                <div
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: legend.color }}
                />
                <span className='text-slate-500 font-aether-label'>{legend.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UptimePanel;
