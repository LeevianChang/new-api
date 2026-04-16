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
  Empty,
  Pagination,
  Button,
  Tag,
  Space,
} from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import {
  calculateModelPrice,
  formatPriceInfo,
  getLobeHubIcon,
  stringToColor,
} from '../../../../../helpers';
import PricingCardSkeleton from './PricingCardSkeleton';
import { useMinimumLoadingTime } from '../../../../../hooks/common/useMinimumLoadingTime';
import { useIsMobile } from '../../../../../hooks/common/useIsMobile';

const PricingCardViewCyber = ({
  filteredModels,
  loading,
  rowSelection,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  selectedGroup,
  groupRatio,
  copyText,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  showRatio,
  t,
  selectedRowKeys = [],
  setSelectedRowKeys,
  openModelDetail,
}) => {
  const showSkeleton = useMinimumLoadingTime(loading);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedModels = filteredModels.slice(
    startIndex,
    startIndex + pageSize,
  );
  const getModelKey = (model) => model.key ?? model.model_name ?? model.id;
  const isMobile = useIsMobile();

  const getModelIcon = (model) => {
    const iconKey = model.icon || model.vendor_icon;
    if (iconKey) {
      return getLobeHubIcon(iconKey, 32);
    }
    return null;
  };

  const getTagLabel = (model) => {
    if (model.quota_type === 1) return t('按次计费');
    if (model.quota_type === 0) return t('按量计费');
    return '-';
  };

  const getTagColor = (model) => {
    if (model.quota_type === 1) return 'teal';
    if (model.quota_type === 0) return 'violet';
    return 'white';
  };

  if (showSkeleton) {
    return (
      <PricingCardSkeleton
        rowSelection={!!rowSelection}
        showRatio={showRatio}
      />
    );
  }

  if (!filteredModels || filteredModels.length === 0) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Empty
          image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
          darkModeImage={
            <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
          }
          description={t('搜索无结果')}
        />
      </div>
    );
  }

  return (
    <div className='px-2 pt-2'>
      <div className='grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6'>
        {paginatedModels.map((model, index) => {
          const modelKey = getModelKey(model);
          const isSelected = selectedRowKeys.includes(modelKey);

          const priceData = calculateModelPrice({
            record: model,
            selectedGroup,
            groupRatio,
            tokenUnit,
            displayPrice,
            currency,
            quotaDisplayType: siteDisplayType,
          });

          return (
            <div
              key={modelKey || index}
              className='glass-panel group relative flex flex-col p-6 rounded-3xl border border-[#47474e]/10 hover:border-[#8ff5ff]/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(143,245,255,0.05)] overflow-hidden cursor-pointer'
              onClick={() => openModelDetail && openModelDetail(model)}
            >
              <div className='absolute -right-4 -top-4 w-32 h-32 bg-[#8ff5ff]/5 rounded-full blur-3xl group-hover:bg-[#8ff5ff]/10 transition-colors'></div>
              
              <div className='flex justify-between items-start mb-6 relative z-10'>
                <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8ff5ff]/20 to-[#aa8aff]/20 flex items-center justify-center text-[#8ff5ff]'>
                  {getModelIcon(model) || (
                    <span className='material-symbols-outlined text-3xl'>psychology</span>
                  )}
                </div>
                <div className={`px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase font-headline ${
                  model.quota_type === 0 
                    ? 'bg-[#aa8aff]/10 text-[#aa8aff]'  // 按量计费 - 紫色
                    : model.quota_type === 1
                    ? 'bg-teal/10 text-teal'  // 按次计费 - teal色
                    : 'bg-[#8ff5ff]/10 text-[#8ff5ff]'  // 默认 - 青色
                }`}>
                  {getTagLabel(model)}
                </div>
              </div>

              <h3 className='text-xl font-headline font-bold mb-3 text-[#f7f5fd] truncate relative z-10'>
                {model.model_name}
              </h3>
              
              {model.description && (
                <p className='text-xs text-[#abaab1] mb-4 font-medium line-clamp-2 leading-relaxed relative z-10'>
                  {model.description}
                </p>
              )}

              {model.tags && (
                <div className='mb-4 relative z-10'>
                  <div className='flex flex-wrap gap-2'>
                    {model.tags.split(',').filter((tag) => tag.trim()).slice(0, 5).map((tag, idx) => {
                      // 使用粉色、紫色和橙红色系
                      const colors = [
                        { bg: 'bg-[#ff59e3]/10', text: 'text-[#ff59e3]', border: 'border-[#ff59e3]/30' },  // 粉色
                        { bg: 'bg-[#aa8aff]/10', text: 'text-[#aa8aff]', border: 'border-[#aa8aff]/30' },  // 紫色
                        { bg: 'bg-[#FF716C]/10', text: 'text-[#FF716C]', border: 'border-[#FF716C]/30' },  // 橙红色
                      ];
                      const colorScheme = colors[idx % colors.length];
                      
                      return (
                        <div
                          key={idx}
                          className={`px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase font-headline transition-all duration-300 hover:brightness-125 cursor-default ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`}
                        >
                          {tag.trim()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className='bg-[#1a1b23]/50 p-4 rounded-xl backdrop-blur-sm border border-[#47474e]/5 mb-6 relative z-10'>
                <div className='flex flex-col gap-2 text-xs'>
                  {formatPriceInfo(priceData, t, siteDisplayType)}
                </div>
              </div>

              {showRatio && (
                <div className='bg-[#1a1b23]/50 p-4 rounded-xl backdrop-blur-sm border border-[#47474e]/5 mb-6 relative z-10'>
                  <div className='flex items-center gap-2 mb-3'>
                    <span className='text-xs font-medium text-[#8ff5ff] tracking-wider uppercase font-headline'>
                      {t('倍率信息')}
                    </span>
                  </div>
                  <div className='grid grid-cols-3 gap-3 text-xs'>
                    <div className='flex flex-col'>
                      <span className='text-[#75757b] mb-1'>{t('模型')}</span>
                      <span className='text-[#f7f5fd] font-mono'>
                        {model.quota_type === 0 ? model.model_ratio : t('无')}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[#75757b] mb-1'>{t('补全')}</span>
                      <span className='text-[#f7f5fd] font-mono'>
                        {model.quota_type === 0
                          ? parseFloat(model.completion_ratio.toFixed(3))
                          : t('无')}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[#75757b] mb-1'>{t('分组')}</span>
                      <span className='text-[#f7f5fd] font-mono'>
                        {priceData?.usedGroupRatio ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className='mt-auto flex gap-3 relative z-10'>
                <Button
                  theme='borderless'
                  style={{ 
                    color: '#ffffff',
                    backgroundColor: '#24252d',
                    border: '1px solid rgba(71, 71, 78, 0.2)'
                  }}
                  className='flex-1 py-3 font-headline text-sm font-bold rounded-xl transition-all hover:border-[#8ff5ff]/50 hover:bg-[#2a2b33]'
                  onClick={(e) => {
                    e.stopPropagation();
                    openModelDetail && openModelDetail(model);
                  }}
                >
                  {t('详情')}
                </Button>
                <Button
                  theme='borderless'
                  style={{
                    backgroundColor: '#8ff5ff',
                    color: '#005d63'
                  }}
                  className='flex-1 py-3 font-headline text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(143,245,255,0.5)] transition-all hover:brightness-110'
                  onClick={(e) => {
                    e.stopPropagation();
                    copyText(model.model_name);
                  }}
                >
                  {t('选择')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModels.length > 0 && (
        <div className='flex justify-center mt-6 py-4 border-t border-[#47474e]/10'>
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={filteredModels.length}
            showSizeChanger={true}
            pageSizeOptions={[10, 20, 50, 100]}
            size={isMobile ? 'small' : 'default'}
            showQuickJumper={!isMobile}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PricingCardViewCyber;
