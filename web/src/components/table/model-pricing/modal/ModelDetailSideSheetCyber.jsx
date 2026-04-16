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
import { SideSheet, Typography, Button } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';

import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import ModelHeader from './components/ModelHeader';
import ModelBasicInfoCyber from './components/ModelBasicInfoCyber';
import ModelEndpointsCyber from './components/ModelEndpointsCyber';
import ModelPricingTableCyber from './components/ModelPricingTableCyber';

const { Text } = Typography;

const ModelDetailSideSheetCyber = ({
  visible,
  onClose,
  modelData,
  groupRatio,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  showRatio,
  usableGroup,
  vendorsMap,
  endpointMap,
  autoGroups,
  t,
}) => {
  const isMobile = useIsMobile();

  return (
    <SideSheet
      className='cyberpunk-sidesheet'
      placement='right'
      title={
        <ModelHeader modelData={modelData} vendorsMap={vendorsMap} t={t} />
      }
      bodyStyle={{
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0d0e13',
        color: '#f7f5fd',
      }}
      headerStyle={{
        backgroundColor: 'rgba(24, 25, 32, 0.6)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(71, 71, 78, 0.2)',
      }}
      style={{
        backgroundColor: '#0d0e13',
      }}
      visible={visible}
      width={isMobile ? '100%' : 600}
      closeIcon={
        <Button
          theme='borderless'
          style={{ color: '#8ff5ff' }}
          type='button'
          icon={<IconClose />}
          onClick={onClose}
        />
      }
      onCancel={onClose}
    >
      <div className='p-2' style={{ backgroundColor: '#0d0e13' }}>
        {!modelData && (
          <div className='flex justify-center items-center py-10'>
            <Text style={{ color: '#abaab1' }}>{t('加载中...')}</Text>
          </div>
        )}
        {modelData && (
          <>
            <ModelBasicInfoCyber
              modelData={modelData}
              vendorsMap={vendorsMap}
              t={t}
            />
            <ModelEndpointsCyber
              modelData={modelData}
              endpointMap={endpointMap}
              t={t}
            />
            <ModelPricingTableCyber
              modelData={modelData}
              groupRatio={groupRatio}
              currency={currency}
              siteDisplayType={siteDisplayType}
              tokenUnit={tokenUnit}
              displayPrice={displayPrice}
              showRatio={showRatio}
              usableGroup={usableGroup}
              autoGroups={autoGroups}
              t={t}
            />
          </>
        )}
      </div>
    </SideSheet>
  );
};

export default ModelDetailSideSheetCyber;
