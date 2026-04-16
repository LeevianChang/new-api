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
import { Table, Tag } from '@douyinfe/semi-ui';
import { calculateModelPrice, getModelPriceItems } from '../../../../../helpers';

const ModelPricingTableCyber = ({
  modelData,
  groupRatio,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  showRatio,
  usableGroup,
  autoGroups = [],
  t,
}) => {
  const modelEnableGroups = Array.isArray(modelData?.enable_groups)
    ? modelData.enable_groups
    : [];
  const autoChain = autoGroups.filter((g) => modelEnableGroups.includes(g));

  const renderGroupPriceTable = () => {
    const availableGroups = Object.keys(usableGroup || {})
      .filter((g) => g !== '')
      .filter((g) => g !== 'auto')
      .filter((g) => modelEnableGroups.includes(g));

    const tableData = availableGroups.map((group) => {
      const priceData = modelData
        ? calculateModelPrice({
            record: modelData,
            selectedGroup: group,
            groupRatio,
            tokenUnit,
            displayPrice,
            currency,
            quotaDisplayType: siteDisplayType,
          })
        : { inputPrice: '-', outputPrice: '-', price: '-' };

      const groupRatioValue =
        groupRatio && groupRatio[group] ? groupRatio[group] : 1;

      return {
        key: group,
        group: group,
        ratio: groupRatioValue,
        billingType:
          modelData?.quota_type === 0
            ? t('按量计费')
            : modelData?.quota_type === 1
              ? t('按次计费')
              : '-',
        priceItems: getModelPriceItems(priceData, t, siteDisplayType),
      };
    });

    const columns = [
      {
        title: t('分组'),
        dataIndex: 'group',
        render: (text) => (
          <Tag 
            size='small' 
            shape='circle'
            style={{
              backgroundColor: 'rgba(170, 138, 255, 0.1)',
              borderColor: 'rgba(170, 138, 255, 0.3)',
              color: '#aa8aff'
            }}
          >
            {text}
            {t('分组')}
          </Tag>
        ),
      },
    ];

    if (showRatio) {
      columns.push({
        title: t('倍率'),
        dataIndex: 'ratio',
        render: (text) => (
          <Tag 
            size='small' 
            shape='circle'
            style={{
              backgroundColor: 'rgba(170, 138, 255, 0.1)',
              borderColor: 'rgba(170, 138, 255, 0.3)',
              color: '#aa8aff'
            }}
          >
            {text}x
          </Tag>
        ),
      });
    }

    columns.push({
      title: t('计费类型'),
      dataIndex: 'billingType',
      render: (text) => {
        let bgColor = 'rgba(170, 138, 255, 0.1)';
        let borderColor = 'rgba(170, 138, 255, 0.3)';
        let textColor = '#aa8aff';
        
        if (text === t('按量计费')) {
          bgColor = 'rgba(170, 138, 255, 0.1)';
          borderColor = 'rgba(170, 138, 255, 0.3)';
          textColor = '#aa8aff';
        } else if (text === t('按次计费')) {
          bgColor = 'rgba(0, 128, 128, 0.1)';
          borderColor = 'rgba(0, 128, 128, 0.3)';
          textColor = 'rgb(var(--semi-teal-5))';
        }
        
        return (
          <Tag 
            size='small' 
            shape='circle'
            style={{
              backgroundColor: bgColor,
              borderColor: borderColor,
              color: textColor
            }}
          >
            {text || '-'}
          </Tag>
        );
      },
    });

    columns.push({
      title: siteDisplayType === 'TOKENS' ? t('计费摘要') : t('价格摘要'),
      dataIndex: 'priceItems',
      render: (items) => (
        <div className='space-y-1'>
          {items.map((item) => (
            <div key={item.key} className='text-[#abaab1]'>
              <span className='font-semibold text-[#aa8aff]'>{item.label}</span>{' '}
              <span className='text-[#f7f5fd]'>{item.value}</span>
              <span className='text-xs text-[#75757b] ml-1'>{item.suffix}</span>
            </div>
          ))}
        </div>
      ),
    });

    return (
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        size='small'
        bordered={false}
        className='cyber-table'
        style={{
          backgroundColor: 'transparent',
          color: '#f7f5fd'
        }}
      />
    );
  };

  return (
    <div className='glass-panel p-6 rounded-3xl border border-[#47474e]/10'>
      <div className='flex items-center mb-4'>
        <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff59e3]/20 to-[#8ff5ff]/20 flex items-center justify-center mr-3'>
          <span className='material-symbols-outlined text-[#a855f7] text-lg'>payments</span>
        </div>
        <div>
          <div className='text-lg font-headline font-bold text-[#f7f5fd]'>{t('分组价格')}</div>
          <div className='text-xs text-[#75757b] font-headline tracking-wider'>
            {t('不同用户分组的价格信息')}
          </div>
        </div>
      </div>
      {autoChain.length > 0 && (
        <div className='flex flex-wrap items-center gap-2 mb-4 p-3 bg-[#121319]/50 rounded-xl border border-[#47474e]/10'>
          <span className='text-sm text-[#abaab1] font-headline'>{t('auto分组调用链路')}</span>
          <span className='text-sm text-[#aa8aff]'>→</span>
          {autoChain.map((g, idx) => (
            <React.Fragment key={g}>
              <Tag 
                size='small' 
                shape='circle'
                style={{
                  backgroundColor: 'rgba(170, 138, 255, 0.1)',
                  borderColor: 'rgba(170, 138, 255, 0.3)',
                  color: '#aa8aff'
                }}
              >
                {g}
                {t('分组')}
              </Tag>
              {idx < autoChain.length - 1 && <span className='text-sm text-[#aa8aff]'>→</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      {renderGroupPriceTable()}
    </div>
  );
};

export default ModelPricingTableCyber;
