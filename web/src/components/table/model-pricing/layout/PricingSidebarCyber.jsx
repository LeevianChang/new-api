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
import { getLobeHubIcon } from '../../../../helpers';
import { resetPricingFilters } from '../../../../helpers/utils';
import { usePricingFilterCounts } from '../../../../hooks/model-pricing/usePricingFilterCounts';

const PricingSidebarCyber = ({
  showWithRecharge,
  setShowWithRecharge,
  currency,
  setCurrency,
  handleChange,
  setActiveKey,
  showRatio,
  setShowRatio,
  viewMode,
  setViewMode,
  filterGroup,
  setFilterGroup,
  handleGroupClick,
  filterQuotaType,
  setFilterQuotaType,
  filterEndpointType,
  setFilterEndpointType,
  filterVendor,
  setFilterVendor,
  filterTag,
  setFilterTag,
  currentPage,
  setCurrentPage,
  tokenUnit,
  setTokenUnit,
  loading,
  t,
  ...categoryProps
}) => {
  const {
    quotaTypeModels,
    endpointTypeModels,
    vendorModels,
    tagModels,
    groupCountModels,
  } = usePricingFilterCounts({
    models: categoryProps.models,
    filterGroup,
    filterQuotaType,
    filterEndpointType,
    filterVendor,
    filterTag,
    searchValue: categoryProps.searchValue,
  });

  const handleResetFilters = () =>
    resetPricingFilters({
      handleChange,
      setShowWithRecharge,
      setCurrency,
      setShowRatio,
      setViewMode,
      setFilterGroup,
      setFilterQuotaType,
      setFilterEndpointType,
      setFilterVendor,
      setFilterTag,
      setCurrentPage,
      setTokenUnit,
    });

  // 获取供应商列表
  const getVendors = () => {
    const vendors = new Map();
    const vendorIcons = new Map();
    
    categoryProps.models.forEach((model) => {
      if (model.vendor_name) {
        vendors.set(model.vendor_name, (vendors.get(model.vendor_name) || 0) + 1);
        if (model.vendor_icon && !vendorIcons.has(model.vendor_name)) {
          vendorIcons.set(model.vendor_name, model.vendor_icon);
        }
      }
    });

    return { vendors, vendorIcons };
  };

  const { vendors, vendorIcons } = getVendors();

  // 获取分组列表
  const getGroups = () => {
    const groups = categoryProps.usableGroup || {};
    return Object.keys(groups).filter(g => g !== '' && g !== 'auto');
  };

  const groups = getGroups();

  // 获取标签列表
  const getTags = () => {
    const tags = new Set();
    categoryProps.models.forEach((model) => {
      if (model.tags) {
        model.tags.split(',').forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) tags.add(trimmed);
        });
      }
    });
    return Array.from(tags);
  };

  const tags = getTags();

  // 获取端点类型列表
  const getEndpoints = () => {
    const endpoints = new Set();
    categoryProps.models.forEach((model) => {
      if (model.supported_endpoint_types) {
        model.supported_endpoint_types.forEach(type => endpoints.add(type));
      }
    });
    return Array.from(endpoints);
  };

  const endpoints = getEndpoints();

  return (
    <div className='p-6 space-y-6 overflow-y-auto pricing-scroll-hide' style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-[#ff59e3] animate-pulse shadow-[0_0_8px_#ff59e3]'></div>
          <span className='font-headline text-xs tracking-widest text-[#75757b] uppercase'>
            {t('筛选模块')}
          </span>
        </div>
      </div>

      {/* Provider Section */}
      <section className='glass-panel rounded-xl p-4 border border-[#8ff5ff]/20 shadow-xl'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-[#8ff5ff] text-lg'>dns</span>
            <h3 className='font-headline font-bold tracking-wider text-xs uppercase text-[#f7f5fd]'>
              {t('供应商')}
            </h3>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => setFilterVendor('all')}
            className={`px-4 py-2 rounded-lg font-headline text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              filterVendor === 'all'
                ? 'bg-[#8ff5ff]/20 text-[#8ff5ff] border border-[#8ff5ff]/50 shadow-[0_0_15px_rgba(143,245,255,0.15)]'
                : 'bg-[#24252d] text-[#75757b] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/5 border border-[#47474e]/20'
            }`}
          >
            {t('全部')}
          </button>
          {Array.from(vendors.keys()).map((vendor) => (
            <button
              key={vendor}
              onClick={() => setFilterVendor(vendor)}
              className={`px-4 py-2 rounded-lg font-headline text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
                filterVendor === vendor
                  ? 'bg-[#8ff5ff]/20 text-[#8ff5ff] border border-[#8ff5ff]/50 shadow-[0_0_15px_rgba(143,245,255,0.15)]'
                  : 'bg-[#24252d] text-[#75757b] hover:text-[#8ff5ff] hover:bg-[#8ff5ff]/5 border border-[#47474e]/20'
              }`}
            >
              {vendorIcons.has(vendor) && (
                <span className='w-4 h-4 flex items-center justify-center'>
                  {getLobeHubIcon(vendorIcons.get(vendor), 16)}
                </span>
              )}
              {vendor}
            </button>
          ))}
        </div>
      </section>

      {/* Key Groups Section */}
      {groups.length > 0 && (
        <section className='glass-panel rounded-xl p-4 border border-[#8ff5ff]/20 shadow-xl'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-[#aa8aff] text-lg'>group_work</span>
              <h3 className='font-headline font-bold tracking-wider text-xs uppercase text-[#f7f5fd]'>
                {t('分组')}
              </h3>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div
              onClick={() => handleGroupClick('all')}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                filterGroup === 'all'
                  ? 'bg-[#aa8aff]/10 border border-[#aa8aff]/20'
                  : 'bg-[#24252d]/40 border border-[#47474e]/10 hover:border-[#aa8aff]/30'
              }`}
            >
              <div className='flex items-center gap-2'>
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center p-0.5 ${
                  filterGroup === 'all' ? 'border-[#aa8aff]' : 'border-[#75757b]'
                }`}>
                  {filterGroup === 'all' && <div className='w-full h-full bg-[#aa8aff] rounded-full'></div>}
                </div>
                <span className={`font-headline text-xs tracking-tighter font-bold ${
                  filterGroup === 'all' ? 'text-[#aa8aff]' : 'text-[#abaab1]'
                }`}>
                  {t('全部')}
                </span>
              </div>
              <span className={`font-mono text-[10px] font-bold ${
                filterGroup === 'all' ? 'text-[#aa8aff]' : 'text-[#75757b]'
              }`}>
                1x
              </span>
            </div>
            {groups.map((group) => {
              const ratio = categoryProps.groupRatio?.[group];
              return (
                <div
                  key={group}
                  onClick={() => handleGroupClick(group)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    filterGroup === group
                      ? 'bg-[#aa8aff]/10 border border-[#aa8aff]/20'
                      : 'bg-[#24252d]/40 border border-[#47474e]/10 hover:border-[#aa8aff]/30'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center p-0.5 ${
                      filterGroup === group ? 'border-[#aa8aff]' : 'border-[#75757b]'
                    }`}>
                      {filterGroup === group && <div className='w-full h-full bg-[#aa8aff] rounded-full'></div>}
                    </div>
                    <span className={`font-headline text-xs tracking-tighter font-medium ${
                      filterGroup === group ? 'text-[#aa8aff]' : 'text-[#abaab1]'
                    }`}>
                      {group}
                    </span>
                  </div>
                  {ratio !== undefined && (
                    <span className={`font-mono text-[10px] font-bold ${
                      filterGroup === group ? 'text-[#aa8aff]' : 'text-[#75757b]'
                    }`}>
                      {ratio}x
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Billing Type Section */}
      <section className='glass-panel rounded-xl p-4 border border-[#8ff5ff]/20 shadow-xl'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='material-symbols-outlined text-[#ff59e3] text-lg'>receipt_long</span>
          <h3 className='font-headline font-bold tracking-wider text-xs uppercase text-[#f7f5fd]'>
            {t('计费类型')}
          </h3>
        </div>
        <div className='bg-[#000000]/50 p-1 rounded-lg flex border border-[#47474e]/20'>
          <button
            onClick={() => setFilterQuotaType('all')}
            className={`flex-1 py-2 text-xs font-headline font-bold tracking-widest uppercase rounded transition-all ${
              filterQuotaType === 'all'
                ? 'bg-[#ff59e3] text-[#42003a] shadow-lg'
                : 'text-[#75757b] hover:text-[#ff59e3]'
            }`}
          >
            {t('全部')}
          </button>
          <button
            onClick={() => setFilterQuotaType(0)}
            className={`flex-1 py-2 text-xs font-headline font-bold tracking-widest uppercase rounded transition-all ${
              filterQuotaType === 0
                ? 'bg-[#ff59e3] text-[#42003a] shadow-lg'
                : 'text-[#75757b] hover:text-[#ff59e3]'
            }`}
          >
            {t('按量')}
          </button>
          <button
            onClick={() => setFilterQuotaType(1)}
            className={`flex-1 py-2 text-xs font-headline font-bold tracking-widest uppercase rounded transition-all ${
              filterQuotaType === 1
                ? 'bg-[#ff59e3] text-[#42003a] shadow-lg'
                : 'text-[#75757b] hover:text-[#ff59e3]'
            }`}
          >
            {t('按次')}
          </button>
        </div>
      </section>

      {/* Tags & Endpoints Grid */}
      <div className='grid grid-cols-1 gap-4'>
        {/* Tags Section */}
        {tags.length > 0 && (
          <section className='glass-panel rounded-xl p-4 border border-[#8ff5ff]/20 shadow-xl'>
            <div className='flex items-center gap-2 mb-4'>
              <span className='material-symbols-outlined text-[#8ff5ff] text-lg'>sell</span>
              <h3 className='font-headline font-bold tracking-wider text-xs uppercase text-[#f7f5fd]'>
                {t('标签')}
              </h3>
            </div>
            <div className='flex flex-wrap gap-2'>
              <span
                onClick={() => setFilterTag('all')}
                className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold tracking-widest uppercase cursor-pointer transition-all ${
                  filterTag === 'all'
                    ? 'bg-[#8ff5ff]/10 text-[#8ff5ff] border border-[#8ff5ff]/30'
                    : 'bg-[#24252d] text-[#75757b] border border-[#47474e]/10 hover:border-[#8ff5ff]/40'
                }`}
              >
                {t('全部')}
              </span>
              {tags.map((tag, idx) => {
                // 使用粉色、紫色和橙红色系循环配色，与详情页保持一致
                const colors = [
                  { bg: 'bg-[#ff59e3]/10', text: 'text-[#ff59e3]', border: 'border-[#ff59e3]/30', hoverBorder: 'hover:border-[#ff59e3]/40' },  // 粉色
                  { bg: 'bg-[#aa8aff]/10', text: 'text-[#aa8aff]', border: 'border-[#aa8aff]/30', hoverBorder: 'hover:border-[#aa8aff]/40' },  // 紫色
                  { bg: 'bg-[#FF716C]/10', text: 'text-[#FF716C]', border: 'border-[#FF716C]/30', hoverBorder: 'hover:border-[#FF716C]/40' },  // 橙红色
                ];
                const colorScheme = colors[idx % colors.length];
                
                return (
                  <span
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold tracking-widest uppercase cursor-pointer transition-all ${
                      filterTag === tag
                        ? `${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`
                        : `bg-[#24252d] text-[#75757b] border border-[#47474e]/10 ${colorScheme.hoverBorder}`
                    }`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Endpoint Types Section */}
        {endpoints.length > 0 && (
          <section className='glass-panel rounded-xl p-4 border border-[#8ff5ff]/20 shadow-xl'>
            <div className='flex items-center gap-2 mb-4'>
              <span className='material-symbols-outlined text-[#8ff5ff] text-lg'>terminal</span>
              <h3 className='font-headline font-bold tracking-wider text-xs uppercase text-[#f7f5fd]'>
                {t('端点')}
              </h3>
            </div>
            <div className='space-y-2'>
              <label
                className='flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer'
                onClick={() => setFilterEndpointType('all')}
              >
                <span className={`font-headline text-xs font-medium ${
                  filterEndpointType === 'all' ? 'text-[#8ff5ff]' : 'text-[#75757b]'
                }`}>
                  {t('全部端点')}
                </span>
                <input
                  type='checkbox'
                  checked={filterEndpointType === 'all'}
                  onChange={() => {}}
                  className='rounded-sm bg-[#24252d] border-[#47474e] text-[#8ff5ff] focus:ring-[#8ff5ff]/20'
                />
              </label>
              {endpoints.map((endpoint) => (
                <label
                  key={endpoint}
                  className='flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer'
                  onClick={() => setFilterEndpointType(endpoint)}
                >
                  <span className={`font-headline text-xs font-medium ${
                    filterEndpointType === endpoint ? 'text-[#8ff5ff]' : 'text-[#75757b]'
                  }`}>
                    {endpoint}
                  </span>
                  <input
                    type='checkbox'
                    checked={filterEndpointType === endpoint}
                    onChange={() => {}}
                    className='rounded-sm bg-[#24252d] border-[#47474e] text-[#8ff5ff] focus:ring-[#8ff5ff]/20'
                  />
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Summary & Actions */}
      <section className='glass-panel rounded-xl p-4 border border-[#8ff5ff]/20 shadow-2xl shadow-[#8ff5ff]/5'>
        <h3 className='font-headline font-bold tracking-wider text-xs uppercase mb-4 text-[#8ff5ff]'>
          {t('摘要')}
        </h3>
        <ul className='space-y-2 mb-4'>
          <li className='flex justify-between items-center text-xs'>
            <span className='text-[#75757b] font-headline uppercase'>{t('总模型数')}</span>
            <span className='text-[#f7f5fd] font-headline font-bold'>{categoryProps.models?.length || 0}</span>
          </li>
          <li className='flex justify-between items-center text-xs'>
            <span className='text-[#75757b] font-headline uppercase'>{t('已筛选')}</span>
            <span className='text-[#8ff5ff] font-headline font-bold'>
              {filterVendor === 'all' && filterGroup === 'all' && filterQuotaType === 'all' && filterTag === 'all' && filterEndpointType === 'all'
                ? t('无')
                : t('是')}
            </span>
          </li>
        </ul>
        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={handleResetFilters}
            className='py-2 rounded-lg border border-[#47474e]/30 text-xs font-headline font-bold tracking-widest uppercase text-[#75757b] hover:bg-white/5 transition-all active:scale-95'
          >
            {t('重置')}
          </button>
          <button
            className='py-2 rounded-lg bg-[#8ff5ff] text-[#005d63] text-xs font-headline font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[#8ff5ff]/40 hover:scale-[1.02] transition-all active:scale-95'
          >
            {t('应用')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default PricingSidebarCyber;
