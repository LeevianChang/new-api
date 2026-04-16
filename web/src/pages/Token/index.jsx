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
import TokensTable from '../../components/table/tokens';

const Token = () => {
  return (
    <div className='mt-[60px] px-2 relative min-h-screen overflow-hidden'>
      {/* Ambient Decorative Background */}
      <div 
        className='fixed -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none'
        style={{
          background: 'rgba(143, 245, 255, 0.15)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />
      <div 
        className='fixed -bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none'
        style={{
          background: 'rgba(255, 89, 227, 0.15)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />
      
      <div className='relative z-10'>
        <TokensTable />
      </div>
    </div>
  );
};

export default Token;
