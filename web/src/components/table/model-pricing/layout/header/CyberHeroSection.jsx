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

import React, { useMemo } from 'react';
import { getLobeHubIcon } from '../../../../../helpers';

const CyberHeroSection = ({ 
  filterVendor, 
  models = [], 
  allModels = [],
  vendorsMap = {},
  t 
}) => {
  // 获取供应商信息
  const vendorInfo = useMemo(() => {
    const vendors = new Map();
    let unknownCount = 0;

    (allModels.length > 0 ? allModels : models).forEach((model) => {
      if (model.vendor_name) {
        const current = vendors.get(model.vendor_name) || { count: 0, icon: null };
        vendors.set(model.vendor_name, {
          count: current.count + 1,
          icon: current.icon || model.vendor_icon,
        });
      } else {
        unknownCount++;
      }
    });

    return { vendors, unknownCount };
  }, [allModels, models]);

  // 获取当前显示的供应商信息
  const currentVendor = useMemo(() => {
    if (filterVendor === 'all') {
      return {
        name: t('全部供应商'),
        description: t('查看所有可用的AI模型供应商，包括众多知名供应商的模型。'),
        count: models.length,
        icon: null,
      };
    }

    if (filterVendor === 'unknown') {
      return {
        name: t('未知供应商'),
        description: t('包含来自未知或未标明供应商的AI模型，这些模型可能来自小型供应商或开源项目。'),
        count: vendorInfo.unknownCount,
        icon: null,
      };
    }

    const info = vendorInfo.vendors.get(filterVendor);
    return {
      name: filterVendor,
      description: t('该供应商提供多种AI模型，适用于不同的应用场景。'),
      count: info?.count || 0,
      icon: info?.icon,
    };
  }, [filterVendor, models, vendorInfo, t]);

  // 计算平均延迟（模拟数据）
  const avgLatency = useMemo(() => {
    return Math.floor(20 + Math.random() * 10);
  }, [filterVendor]);

  return (
    <div className='mb-0 relative overflow-hidden pt-12 px-12 pb-12 rounded-3xl bg-gradient-to-br from-[#121319] to-[#0d0e13] border border-[#47474e]/10'>
      {/* Background decorative flares */}
      <div className='absolute top-0 right-0 w-96 h-96 bg-[#8ff5ff]/5 blur-[120px] rounded-full pointer-events-none'></div>
      <div className='absolute bottom-0 left-0 w-64 h-64 bg-[#ff59e3]/5 blur-[100px] rounded-full pointer-events-none'></div>
      
      <div className='relative z-10 flex flex-col md:flex-row justify-between items-end gap-8'>
        <div className='max-w-2xl'>
          <div className='flex items-center gap-2 text-[#8ff5ff] font-headline text-xs tracking-[0.3em] uppercase mb-4'>
            <span className='w-2 h-2 rounded-full bg-[#8ff5ff] animate-pulse shadow-[0_0_8px_#8ff5ff]'></span>
            {t('网络在线')}
          </div>
          
          {/* 供应商名称 - 带切换动画和渐变流动效果 */}
          <h1 
            key={filterVendor}
            className='text-5xl md:text-6xl font-headline font-bold tracking-tighter mb-6 bg-gradient-to-r from-white to-[#8ff5ff] bg-clip-text text-transparent animate-fade-in'
          >
            {currentVendor.icon && (
              <span className='inline-flex items-center justify-center w-16 h-16 mr-4 align-middle'>
                {getLobeHubIcon(currentVendor.icon, 64)}
              </span>
            )}
            {currentVendor.name}
          </h1>
          
          {/* 供应商描述 - 带切换动画 */}
          <p 
            key={`${filterVendor}-desc`}
            className='text-[#abaab1] text-lg leading-relaxed max-w-xl animate-fade-in'
            style={{ animationDelay: '0.1s' }}
          >
            {currentVendor.description}
          </p>
        </div>
        
        {/* 统计信息卡片 - 带切换动画 */}
        <div className='flex gap-4'>
          <div 
            key={`${filterVendor}-models`}
            className='px-6 py-4 glass-panel rounded-2xl border border-[#47474e]/15 flex flex-col animate-slide-up'
          >
            <span className='text-xs text-[#75757b] tracking-widest uppercase font-headline'>
              {t('可用模型')}
            </span>
            <span className='text-2xl font-headline font-bold text-[#8ff5ff]'>
              {currentVendor.count}
            </span>
          </div>
          <div 
            key={`${filterVendor}-latency`}
            className='px-6 py-4 glass-panel rounded-2xl border border-[#47474e]/15 flex flex-col animate-slide-up'
            style={{ animationDelay: '0.1s' }}
          >
            <span className='text-xs text-[#75757b] tracking-widest uppercase font-headline'>
              {t('平均延迟')}
            </span>
            <span className='text-2xl font-headline font-bold text-[#aa8aff]'>
              {avgLatency}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberHeroSection;
