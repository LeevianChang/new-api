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
import { Layout, ImagePreview } from '@douyinfe/semi-ui';
import PricingSidebar from './PricingSidebar';
import PricingSidebarCyber from './PricingSidebarCyber';
import PricingContent from './content/PricingContent';
import ModelDetailSideSheet from '../modal/ModelDetailSideSheet';
import ModelDetailSideSheetCyber from '../modal/ModelDetailSideSheetCyber';
import { useModelPricingData } from '../../../../hooks/model-pricing/useModelPricingData';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const PricingPage = () => {
  const pricingData = useModelPricingData();
  const { Sider, Content } = Layout;
  const isMobile = useIsMobile();
  const [useCyberTheme, setUseCyberTheme] = React.useState(true);
  const allProps = {
    ...pricingData,
    useCyberTheme,
  };

  return (
    <div className={useCyberTheme ? 'cyberpunk-marketplace' : 'bg-white'}>
      <Layout className='pricing-layout' style={useCyberTheme ? { background: '#0d0e13' } : {}}>
        {!isMobile && (
          <Sider className='pricing-scroll-hide pricing-sidebar' style={useCyberTheme ? { background: 'rgba(13, 14, 19, 0.4)', backdropFilter: 'blur(24px)' } : {}}>
            {useCyberTheme ? (
              <PricingSidebarCyber {...allProps} />
            ) : (
              <PricingSidebar {...allProps} />
            )}
          </Sider>
        )}

        <Content className='pricing-scroll-hide pricing-content' style={useCyberTheme ? { background: '#0d0e13' } : {}}>
          <PricingContent
            {...allProps}
            isMobile={isMobile}
            sidebarProps={allProps}
          />
        </Content>
      </Layout>

      <ImagePreview
        src={pricingData.modalImageUrl}
        visible={pricingData.isModalOpenurl}
        onVisibleChange={(visible) => pricingData.setIsModalOpenurl(visible)}
      />

      {useCyberTheme ? (
        <ModelDetailSideSheetCyber
          visible={pricingData.showModelDetail}
          onClose={pricingData.closeModelDetail}
          modelData={pricingData.selectedModel}
          groupRatio={pricingData.groupRatio}
          usableGroup={pricingData.usableGroup}
          currency={pricingData.currency}
          siteDisplayType={pricingData.siteDisplayType}
          tokenUnit={pricingData.tokenUnit}
          displayPrice={pricingData.displayPrice}
          showRatio={allProps.showRatio}
          vendorsMap={pricingData.vendorsMap}
          endpointMap={pricingData.endpointMap}
          autoGroups={pricingData.autoGroups}
          t={pricingData.t}
        />
      ) : (
        <ModelDetailSideSheet
          visible={pricingData.showModelDetail}
          onClose={pricingData.closeModelDetail}
          modelData={pricingData.selectedModel}
          groupRatio={pricingData.groupRatio}
          usableGroup={pricingData.usableGroup}
          currency={pricingData.currency}
          siteDisplayType={pricingData.siteDisplayType}
          tokenUnit={pricingData.tokenUnit}
          displayPrice={pricingData.displayPrice}
          showRatio={allProps.showRatio}
          vendorsMap={pricingData.vendorsMap}
          endpointMap={pricingData.endpointMap}
          autoGroups={pricingData.autoGroups}
          t={pricingData.t}
        />
      )}
    </div>
  );
};

export default PricingPage;
