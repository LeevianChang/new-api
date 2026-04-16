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
import { Tag, Space, Tooltip } from '@douyinfe/semi-ui';
import { IconHelpCircle } from '@douyinfe/semi-icons';
import {
  renderModelTag,
  stringToColor,
  calculateModelPrice,
  getModelPriceItems,
  getLobeHubIcon,
} from '../../../../../helpers';
import {
  renderLimitedItems,
  renderDescription,
} from '../../../../common/ui/RenderUtils';
import { useIsMobile } from '../../../../../hooks/common/useIsMobile';

function renderQuotaType(type, t) {
  switch (type) {
    case 1:
      return (
        <div className='px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase font-headline bg-teal/10 text-teal border border-teal/30'>
          {t('按次计费')}
        </div>
      );
    case 0:
      return (
        <div className='px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase font-headline bg-[#aa8aff]/10 text-[#aa8aff] border border-[#aa8aff]/30'>
          {t('按量计费')}
        </div>
      );
    default:
      return t('未知');
  }
}

// Render vendor name
const renderVendor = (vendorName, vendorIcon, t) => {
  if (!vendorName) return '-';
  return (
    <div className='flex items-center gap-2'>
      {/* Icon with background */}
      <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#8ff5ff]/20 to-[#aa8aff]/20 flex items-center justify-center border border-[#8ff5ff]/30 flex-shrink-0'>
        {getLobeHubIcon(vendorIcon || 'Layers', 18)}
      </div>
      {/* Vendor name */}
      <span className='text-[#abaab1] font-medium'>
        {vendorName}
      </span>
    </div>
  );
};

// Render tags list using RenderUtils
const renderTags = (text) => {
  if (!text) return '-';
  const tagsArr = text.split(',').filter((tag) => tag.trim());
  // 使用粉色、紫色和橙红色系
  const colors = [
    { bg: '#ff59e3', text: '#ff59e3' },  // 粉色
    { bg: '#aa8aff', text: '#aa8aff' },  // 紫色
    { bg: '#FF716C', text: '#FF716C' },  // 橙红色
  ];
  return renderLimitedItems({
    items: tagsArr,
    renderItem: (tag, idx) => {
      const colorScheme = colors[idx % colors.length];
      return (
        <Tag
          key={idx}
          shape='circle'
          size='small'
          style={{
            backgroundColor: `${colorScheme.bg}20`,
            color: colorScheme.text,
            border: `1px solid ${colorScheme.bg}50`,
          }}
        >
          {tag.trim()}
        </Tag>
      );
    },
    maxDisplay: 3,
  });
};

function renderSupportedEndpoints(endpoints) {
  if (!endpoints || endpoints.length === 0) {
    return null;
  }
  return (
    <Space wrap>
      {endpoints.map((endpoint, idx) => (
        <Tag 
          key={endpoint} 
          shape='circle'
          style={{
            backgroundColor: 'rgba(143, 245, 255, 0.1)',
            color: '#8ff5ff',
            border: '1px solid rgba(143, 245, 255, 0.3)',
          }}
        >
          {endpoint}
        </Tag>
      ))}
    </Space>
  );
}

export const getPricingTableColumns = ({
  t,
  selectedGroup,
  groupRatio,
  copyText,
  setModalImageUrl,
  setIsModalOpenurl,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  showRatio,
}) => {
  const isMobile = useIsMobile();
  const priceDataCache = new WeakMap();

  const getPriceData = (record) => {
    let cache = priceDataCache.get(record);
    if (!cache) {
      cache = calculateModelPrice({
        record,
        selectedGroup,
        groupRatio,
        tokenUnit,
        displayPrice,
        currency,
        quotaDisplayType: siteDisplayType,
      });
      priceDataCache.set(record, cache);
    }
    return cache;
  };

  const endpointColumn = {
    title: t('可用端点类型'),
    dataIndex: 'supported_endpoint_types',
    render: (text, record, index) => {
      return renderSupportedEndpoints(text);
    },
  };

  const modelNameColumn = {
    title: t('模型名称'),
    dataIndex: 'model_name',
    render: (text, record, index) => {
      return renderModelTag(text, {
        onClick: () => {
          copyText(text);
        },
      });
    },
    onFilter: (value, record) =>
      record.model_name.toLowerCase().includes(value.toLowerCase()),
  };

  const quotaColumn = {
    title: t('计费类型'),
    dataIndex: 'quota_type',
    render: (text, record, index) => {
      return renderQuotaType(parseInt(text), t);
    },
    sorter: (a, b) => a.quota_type - b.quota_type,
  };

  const descriptionColumn = {
    title: t('描述'),
    dataIndex: 'description',
    render: (text) => (
      <span className='text-[#abaab1]'>
        {renderDescription(text, 200)}
      </span>
    ),
  };

  const tagsColumn = {
    title: t('标签'),
    dataIndex: 'tags',
    render: renderTags,
  };

  const vendorColumn = {
    title: t('供应商'),
    dataIndex: 'vendor_name',
    render: (text, record) => renderVendor(text, record.vendor_icon, t),
  };

  const baseColumns = [
    modelNameColumn,
    vendorColumn,
    descriptionColumn,
    tagsColumn,
    quotaColumn,
  ];

  const ratioColumn = {
    title: () => (
      <div className='flex items-center space-x-1'>
        <span>{t('倍率')}</span>
        <Tooltip content={t('倍率是为了方便换算不同价格的模型')}>
          <IconHelpCircle
            className='text-blue-500 cursor-pointer'
            onClick={() => {
              setModalImageUrl('/ratio.png');
              setIsModalOpenurl(true);
            }}
          />
        </Tooltip>
      </div>
    ),
    dataIndex: 'model_ratio',
    render: (text, record, index) => {
      const completionRatio = parseFloat(record.completion_ratio.toFixed(3));
      const priceData = getPriceData(record);

      return (
        <div className='space-y-1'>
          <div className='text-[#abaab1]'>
            <span className='text-[#8ff5ff] font-semibold'>{t('模型倍率')}</span>：<span className='text-[#f7f5fd]'>{record.quota_type === 0 ? text : t('无')}</span>
          </div>
          <div className='text-[#abaab1]'>
            <span className='text-[#8ff5ff] font-semibold'>{t('补全倍率')}</span>：
            <span className='text-[#f7f5fd]'>{record.quota_type === 0 ? completionRatio : t('无')}</span>
          </div>
          <div className='text-[#abaab1]'>
            <span className='text-[#8ff5ff] font-semibold'>{t('分组倍率')}</span>：<span className='text-[#f7f5fd]'>{priceData?.usedGroupRatio ?? '-'}</span>
          </div>
        </div>
      );
    },
  };

  const priceColumn = {
    title: siteDisplayType === 'TOKENS' ? t('计费摘要') : t('模型价格'),
    dataIndex: 'model_price',
    ...(isMobile ? {} : { fixed: 'right' }),
    render: (text, record, index) => {
      const priceData = getPriceData(record);
      const priceItems = getModelPriceItems(priceData, t, siteDisplayType);

      return (
        <div className='space-y-1'>
          {priceItems.map((item) => (
            <div key={item.key}>
              <span className='text-[#aa8aff] font-semibold'>{item.label}</span>{' '}
              <span className='text-[#f7f5fd]'>{item.value}</span>
              <span className='text-[#abaab1] text-xs ml-1'>{item.suffix}</span>
            </div>
          ))}
        </div>
      );
    },
  };

  const columns = [...baseColumns];
  columns.push(endpointColumn);
  if (showRatio) {
    columns.push(ratioColumn);
  }
  columns.push(priceColumn);
  return columns;
};
