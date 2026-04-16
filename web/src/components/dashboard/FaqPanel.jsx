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
import { Empty } from '@douyinfe/semi-ui';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { marked } from 'marked';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const FaqPanel = ({
  faqData,
  CARD_PROPS,
  FLEX_CENTER_GAP2,
  ILLUSTRATION_SIZE,
  t,
}) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className='aether-glass-panel p-6 rounded-xl lg:col-span-1'>
      <div className='flex items-center gap-2 mb-6'>
        <HelpCircle size={18} className='text-aether-secondary' />
        <h3 className='font-aether-headline text-lg font-bold tracking-tight'>
          {t('常见问答')}
        </h3>
      </div>
      <ScrollableContainer maxHeight='24rem'>
        {faqData.length > 0 ? (
          <div className='space-y-3'>
            {faqData.map((item, index) => (
              <div
                key={index}
                className='bg-white/5 border border-white/5 rounded-lg overflow-hidden transition-all'
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className='flex items-center justify-between p-3 cursor-pointer w-full hover:bg-white/5 transition-all'
                >
                  <span className={`text-sm font-aether-body font-medium text-left ${openIndex === index ? 'text-aether-secondary' : 'text-slate-300'
                    }`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIndex === index && (
                  <div className='px-3 pb-3 text-xs text-slate-500 font-aether-body border-t border-white/5 pt-2'>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(item.answer || ''),
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='flex justify-center items-center py-8'>
            <Empty
              image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
              darkModeImage={
                <IllustrationConstructionDark style={ILLUSTRATION_SIZE} />
              }
              title={t('暂无常见问答')}
              description={t('请联系管理员在系统设置中配置常见问答')}
            />
          </div>
        )}
      </ScrollableContainer>
      {faqData.length > 0 && (
        <button className='w-full mt-4 text-aether-secondary font-aether-label text-[10px] uppercase tracking-widest hover:underline transition-all'>
          {t('查看所有文档')}
        </button>
      )}
    </div>
  );
};

export default FaqPanel;
