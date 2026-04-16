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
import { Button } from '@douyinfe/semi-ui';
import { RefreshCw, Search } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  return (
    <div className='flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4'>
      <div className='transition-opacity duration-1000 ease-in-out' style={{ opacity: greetingVisible ? 1 : 0 }}>
        <h1 className='font-aether-headline text-3xl font-bold tracking-tight text-aether-on-surface'>
          <span className='text-aether-primary aether-neon-glow'>{getGreeting}</span>
        </h1>
      </div>
      <div className='flex items-center gap-4 font-aether-label text-xs'>
        <Button
          type='tertiary'
          icon={<Search size={16} />}
          onClick={showSearchModal}
          className='!bg-aether-secondary/20 hover:!bg-aether-secondary/30 !text-aether-secondary !border-aether-secondary/30 !rounded-lg transition-all'
        />
        <Button
          type='tertiary'
          icon={<RefreshCw size={16} />}
          onClick={refresh}
          loading={loading}
          className='!bg-aether-primary/20 hover:!bg-aether-primary/30 !text-aether-primary !border-aether-primary/30 !rounded-lg transition-all'
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
