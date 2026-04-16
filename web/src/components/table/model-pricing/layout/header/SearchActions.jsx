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

import React, { useCallback } from 'react';
import { Input, Button, Switch, Select, Divider } from '@douyinfe/semi-ui';
import { IconSearch, IconCopy, IconFilter } from '@douyinfe/semi-icons';

const SearchActions = ({
  selectedRowKeys = [],
  copyText,
  handleChange,
  handleCompositionStart,
  handleCompositionEnd,
  isMobile = false,
  searchValue = '',
  setShowFilterModal,
  showWithRecharge,
  setShowWithRecharge,
  currency,
  setCurrency,
  siteDisplayType,
  showRatio,
  setShowRatio,
  viewMode,
  setViewMode,
  tokenUnit,
  setTokenUnit,
  t,
}) => {
    const supportsCurrencyDisplay = siteDisplayType !== 'TOKENS';

    const handleCopyClick = useCallback(() => {
      if (copyText && selectedRowKeys.length > 0) {
        copyText(selectedRowKeys);
      }
    }, [copyText, selectedRowKeys]);

    const handleFilterClick = useCallback(() => {
      setShowFilterModal?.(true);
    }, [setShowFilterModal]);

    const handleViewModeToggle = useCallback(() => {
      setViewMode?.(viewMode === 'table' ? 'card' : 'table');
    }, [viewMode, setViewMode]);

    const handleTokenUnitToggle = useCallback(() => {
      setTokenUnit?.(tokenUnit === 'K' ? 'M' : 'K');
    }, [tokenUnit, setTokenUnit]);

    const handleShowWithRechargeChange = useCallback((checked) => {
      setShowWithRecharge?.(checked);
    }, [setShowWithRecharge]);

    const handleShowRatioChange = useCallback((checked) => {
      setShowRatio?.(checked);
    }, [setShowRatio]);

    return (
      <div className='flex items-center gap-2 w-full'>
        <div className='flex-1'>
          <Input
            prefix={<IconSearch />}
            placeholder={t('模糊搜索模型名称')}
            value={searchValue}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onChange={handleChange}
            showClear
            style={{
              backgroundColor: 'rgba(36, 37, 45, 0.6)',
              borderColor: 'rgba(71, 71, 78, 0.3)',
              color: '#f7f5fd',
            }}
            className='[&_input]:!text-[#f7f5fd] [&_input::placeholder]:!text-[#75757b] [&_.semi-input-prefix]:!text-[#8ff5ff]'
          />
        </div>

        {viewMode === 'table' && (
          <Button
            theme='outline'
            type='primary'
            icon={<IconCopy />}
            onClick={handleCopyClick}
            disabled={selectedRowKeys.length === 0}
            className='!bg-blue-500 hover:!bg-blue-600 !text-white disabled:!bg-gray-300 disabled:!text-gray-500'
          >
            {t('复制')}
          </Button>
        )}

        {!isMobile && (
          <>
            <Divider layout='vertical' margin='8px' />

            {/* 充值价格显示开关 */}
            {supportsCurrencyDisplay && (
              <div 
                className='flex items-center gap-2 cursor-pointer select-none'
                onClick={() => handleShowWithRechargeChange(!showWithRecharge)}
              >
                <span className='text-sm text-white'>{t('充值价格显示')}</span>
                <Switch
                  checked={showWithRecharge}
                  onChange={handleShowWithRechargeChange}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    '--semi-color-primary': '#aa8aff',
                    '--semi-color-primary-hover': '#bb9bff',
                    '--semi-color-primary-active': '#9979ee',
                    '--semi-color-primary-light-default': 'rgba(170, 138, 255, 0.2)',
                    '--semi-color-primary-light-hover': 'rgba(170, 138, 255, 0.3)',
                    '--semi-color-primary-light-active': 'rgba(170, 138, 255, 0.4)',
                  }}
                />
              </div>
            )}

            {/* 货币单位选择 */}
            {supportsCurrencyDisplay && showWithRecharge && (
              <Select
                value={currency}
                onChange={setCurrency}
                optionList={[
                  { value: 'USD', label: 'USD' },
                  { value: 'CNY', label: 'CNY' },
                  { value: 'CUSTOM', label: t('自定义货币') },
                ]}
              />
            )}

            {/* 显示倍率开关 */}
            <div 
              className='flex items-center gap-2 cursor-pointer select-none'
              onClick={() => handleShowRatioChange(!showRatio)}
            >
              <span className='text-sm text-white'>{t('倍率')}</span>
              <Switch 
                checked={showRatio} 
                onChange={handleShowRatioChange}
                onClick={(e) => e.stopPropagation()}
                style={{
                  '--semi-color-primary': '#aa8aff',
                  '--semi-color-primary-hover': '#bb9bff',
                  '--semi-color-primary-active': '#9979ee',
                  '--semi-color-primary-light-default': 'rgba(170, 138, 255, 0.2)',
                  '--semi-color-primary-light-hover': 'rgba(170, 138, 255, 0.3)',
                  '--semi-color-primary-light-active': 'rgba(170, 138, 255, 0.4)',
                }}
              />
            </div>

            {/* 视图模式切换按钮 */}
            <Button
              theme='borderless'
              onClick={handleViewModeToggle}
              style={{
                backgroundColor: viewMode === 'table' ? '#aa8aff' : 'rgba(170, 138, 255, 0.1)',
                color: viewMode === 'table' ? '#ffffff' : '#aa8aff',
                border: `1px solid ${viewMode === 'table' ? '#aa8aff' : 'rgba(170, 138, 255, 0.3)'}`,
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '12px',
                padding: '8px 16px',
                transition: 'all 0.3s',
              }}
              className='font-headline tracking-wider uppercase hover:brightness-110'
            >
              {t('表格视图')}
            </Button>

            {/* Token单位切换按钮 */}
            <Button
              theme='borderless'
              onClick={handleTokenUnitToggle}
              style={{
                backgroundColor: tokenUnit === 'K' ? '#aa8aff' : 'rgba(170, 138, 255, 0.1)',
                color: tokenUnit === 'K' ? '#ffffff' : '#aa8aff',
                border: `1px solid ${tokenUnit === 'K' ? '#aa8aff' : 'rgba(170, 138, 255, 0.3)'}`,
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '12px',
                padding: '8px 16px',
                transition: 'all 0.3s',
              }}
              className='font-headline tracking-wider uppercase hover:brightness-110'
            >
              {tokenUnit}
            </Button>
          </>
        )}

        {isMobile && (
          <Button
            theme='outline'
            type='tertiary'
            icon={<IconFilter />}
            onClick={handleFilterClick}
          >
            {t('筛选')}
          </Button>
        )}
      </div>
    );
};

export default SearchActions;
