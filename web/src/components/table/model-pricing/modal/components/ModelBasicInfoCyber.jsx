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
import { Tag, Space } from '@douyinfe/semi-ui';
import { stringToColor } from '../../../../../helpers';

const ModelBasicInfoCyber = ({ modelData, vendorsMap = {}, t }) => {
  const getModelDescription = () => {
    if (!modelData) return t('暂无模型描述');
    if (modelData.description) return modelData.description;
    if (modelData.vendor_description) return t('供应商信息：') + modelData.vendor_description;
    return t('暂无模型描述');
  };

  const getModelTags = () => {
    const tags = [];
    if (modelData?.tags) {
      const customTags = modelData.tags.split(',').filter((tag) => tag.trim());
      // 使用粉色、紫色和橙红色系
      const colors = ['#ff59e3', '#aa8aff', '#FF716C'];
      customTags.forEach((tag, idx) => {
        const tagText = tag.trim();
        tags.push({ text: tagText, color: colors[idx % colors.length] });
      });
    }
    return tags;
  };

  return (
    <div className='glass-panel p-6 rounded-3xl border border-[#47474e]/10 mb-6'>
      <div className='flex items-center mb-4'>
        <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#8ff5ff]/20 to-[#aa8aff]/20 flex items-center justify-center mr-3'>
          <span className='material-symbols-outlined text-[#ff59e3] text-lg'>info</span>
        </div>
        <div>
          <div className='text-lg font-headline font-bold text-[#f7f5fd]'>{t('基本信息')}</div>
          <div className='text-xs text-[#75757b] font-headline tracking-wider'>
            {t('模型的详细描述和基本特性')}
          </div>
        </div>
      </div>
      <div className='text-[#abaab1]'>
        <p className='mb-4 leading-relaxed'>{getModelDescription()}</p>
        {getModelTags().length > 0 && (
          <Space wrap>
            {getModelTags().map((tag, index) => (
              <Tag 
                key={index} 
                shape='circle' 
                size='small'
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}50`,
                }}
              >
                {tag.text}
              </Tag>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
};

export default ModelBasicInfoCyber;
