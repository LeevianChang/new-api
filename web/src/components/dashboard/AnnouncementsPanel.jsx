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
import { Bell, Clock } from 'lucide-react';
import { marked } from 'marked';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const AnnouncementsPanel = ({
  announcementData,
  announcementLegendData,
  CARD_PROPS,
  ILLUSTRATION_SIZE,
  t,
}) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-aether-primary';
      case 'warning': return 'text-amber-400';
      case 'danger': return 'text-red-400';
      case 'info': return 'text-aether-secondary';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className='aether-glass-panel p-6 rounded-xl lg:col-span-2'>
      <div className='flex items-center gap-2 mb-6'>
        <Bell size={18} className='text-aether-primary' />
        <h3 className='font-aether-headline text-lg font-bold tracking-tight'>
          {t('系统公告')}
        </h3>
        <Tag color='white' shape='circle' size='small'>
          {t('显示最新20条')}
        </Tag>
      </div>
      <ScrollableContainer maxHeight='24rem'>
        {announcementData.length > 0 ? (
          <div className='space-y-4'>
            {announcementData.map((item, idx) => {
              const htmlContent = item.content ? marked.parse(item.content) : '';
              const htmlExtra = item.extra ? marked.parse(item.extra) : '';
              return (
                <div key={idx} className='group cursor-pointer'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className={`text-[10px] font-aether-label px-2 py-0.5 rounded-full ${
                      item.type === 'success' ? 'bg-aether-primary/10 text-aether-primary' :
                      item.type === 'warning' ? 'bg-amber-400/10 text-amber-400' :
                      item.type === 'danger' ? 'bg-red-400/10 text-red-400' :
                      item.type === 'info' ? 'bg-aether-secondary/10 text-aether-secondary' :
                      'bg-slate-400/10 text-slate-400'
                    }`}>
                      {item.type?.toUpperCase() || 'INFO'}
                    </span>
                    <span className='text-[10px] font-aether-label text-slate-500 flex items-center gap-1'>
                      <Clock size={10} />
                      {item.relative || item.time}
                    </span>
                  </div>
                  <h4 className={`font-aether-body text-sm font-semibold text-aether-on-surface group-hover:${getTypeColor(item.type)} transition-all`}>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </h4>
                  {item.extra && (
                    <p className='text-xs text-slate-500 mt-1 line-clamp-1'>
                      <div dangerouslySetInnerHTML={{ __html: htmlExtra }} />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className='flex justify-center items-center py-8'>
            <Empty
              image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
              darkModeImage={
                <IllustrationConstructionDark style={ILLUSTRATION_SIZE} />
              }
              title={t('暂无系统公告')}
              description={t('请联系管理员在系统设置中配置公告信息')}
            />
          </div>
        )}
      </ScrollableContainer>
    </div>
  );
};

export default AnnouncementsPanel;
