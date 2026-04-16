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
import { Badge } from '@douyinfe/semi-ui';

const ModelEndpointsCyber = ({ modelData, endpointMap = {}, t }) => {
  const renderAPIEndpoints = () => {
    if (!modelData) return null;

    const mapping = endpointMap;
    const types = modelData.supported_endpoint_types || [];

    return types.map((type) => {
      const info = mapping[type] || {};
      let path = info.path || '';
      if (path.includes('{model}')) {
        const modelName = modelData.model_name || modelData.modelName || '';
        path = path.replaceAll('{model}', modelName);
      }
      const method = info.method || 'POST';
      return (
        <div
          key={type}
          className='flex justify-between border-b border-dashed last:border-0 py-3 last:pb-0'
          style={{ borderColor: 'rgba(71, 71, 78, 0.3)' }}
        >
          <span className='flex items-center pr-5'>
            <Badge dot style={{ backgroundColor: '#8ff5ff' }} className='mr-2' />
            <span className='text-[#8ff5ff] font-headline font-medium'>{type}</span>
            {path && <span className='text-[#75757b]'>：</span>}
            {path && (
              <span className='text-[#abaab1] md:ml-1 break-all font-mono text-xs'>{path}</span>
            )}
          </span>
          {path && (
            <span className='text-[#75757b] text-xs md:ml-1 font-mono bg-[#121319] px-2 py-1 rounded'>{method}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className='glass-panel p-6 rounded-3xl border border-[#47474e]/10 mb-6'>
      <div className='flex items-center mb-4'>
        <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#aa8aff]/20 to-[#ff59e3]/20 flex items-center justify-center mr-3'>
          <span className='material-symbols-outlined text-[rgb(143_245_255/var(--tw-text-opacity,1))] text-lg'>link</span>
        </div>
        <div>
          <div className='text-lg font-headline font-bold text-[#f7f5fd]'>{t('API端点')}</div>
          <div className='text-xs text-[#75757b] font-headline tracking-wider'>
            {t('模型支持的接口端点信息')}
          </div>
        </div>
      </div>
      <div className='space-y-2'>
        {renderAPIEndpoints()}
      </div>
    </div>
  );
};

export default ModelEndpointsCyber;
