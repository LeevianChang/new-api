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

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='w-full overflow-x-hidden bg-[#0d0e13]'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* 背景装饰 */}
          <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff59e3]/5 blur-[120px] pointer-events-none' />
          <div className='absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#aa8aff]/5 blur-[150px] pointer-events-none' />
          
          {/* Hero Section */}
          <section className='relative min-h-screen flex flex-col items-center justify-center pt-24 px-6 overflow-hidden'>
            {/* 背景图片层 */}
            <div className='absolute inset-0 z-0 opacity-40'>
              <div className='w-full h-full bg-[url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")] bg-cover bg-center mix-blend-screen' />
              <div className='absolute inset-0 bg-gradient-to-b from-[#0d0e13] via-transparent to-[#0d0e13]' />
            </div>
            
            <div className='relative z-10 max-w-5xl text-center space-y-8'>
              <h1 className='font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-[#f7f5fd] via-[#8ff5ff] to-[#00deec]'>
                {t('统一的大模型接口网关')}
              </h1>
              
              <p className='text-[#abaab1] text-lg md:text-xl max-w-2xl mx-auto'>
                {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
              </p>

              {/* BASE URL 输入框 */}
              <div className='flex flex-col md:flex-row items-center justify-center gap-4 w-full pt-4 max-w-2xl mx-auto'>
                <Input
                  readonly
                  value={serverAddress}
                  className='flex-1 !rounded-xl glass-panel !border-[#8ff5ff]/20'
                  size={isMobile ? 'default' : 'large'}
                  suffix={
                    <div className='flex items-center gap-2'>
                      <ScrollList
                        bodyHeight={32}
                        style={{ border: 'unset', boxShadow: 'unset' }}
                      >
                        <ScrollItem
                          mode='wheel'
                          cycled={true}
                          list={endpointItems}
                          selectedIndex={endpointIndex}
                          onSelect={({ index }) => setEndpointIndex(index)}
                        />
                      </ScrollList>
                      <Button
                        type='primary'
                        onClick={handleCopyBaseURL}
                        icon={<IconCopy />}
                        className='!rounded-xl !bg-[#8ff5ff] !text-[#005d63] hover:!shadow-[0_0_20px_rgba(143,245,255,0.3)]'
                      />
                    </div>
                  }
                />
              </div>

              {/* 操作按钮 */}
              <div className='flex flex-col md:flex-row items-center justify-center gap-6 pt-4'>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    type='primary'
                    size={isMobile ? 'default' : 'large'}
                    className='!rounded-xl px-10 py-4 !bg-[#8ff5ff] !text-[#005d63] font-bold text-lg shadow-[0_0_20px_rgba(143,245,255,0.3)] hover:shadow-[0_0_30px_rgba(143,245,255,0.5)]'
                    icon={<IconPlay />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size={isMobile ? 'default' : 'large'}
                    className='!rounded-xl px-10 py-4 glass-panel !border-[#8ff5ff]/20 !text-[#8ff5ff] font-bold text-lg hover:!bg-[#8ff5ff]/10'
                    icon={<IconGithubLogo />}
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/new-api',
                        '_blank',
                      )
                    }
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className='!rounded-xl px-10 py-4 glass-panel !border-[#8ff5ff]/20 !text-[#8ff5ff] font-bold text-lg hover:!bg-[#8ff5ff]/10'
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>
            </div>
          </section>

          {/* 统计数据栏 */}
          <section className='relative z-20 -mt-12 px-6'>
            <div className='max-w-6xl mx-auto glass-panel p-1 rounded-full overflow-hidden border border-[#47474e]/15'>
              <div className='grid grid-cols-1 md:grid-cols-3 divide-x divide-[#47474e]/20 py-6 px-12'>
                <div className='flex flex-col items-center justify-center space-y-1'>
                  <span className='text-xs uppercase tracking-widest text-slate-500'>{t('支持模型')}</span>
                  <div className='flex items-center gap-2'>
                    <span className='w-2 h-2 rounded-full bg-[#8ff5ff] animate-pulse' />
                    <span className='text-3xl font-headline font-bold text-[#8ff5ff]'>40+</span>
                  </div>
                </div>
                <div className='flex flex-col items-center justify-center space-y-1'>
                  <span className='text-xs uppercase tracking-widest text-slate-500'>{t('平均延迟')}</span>
                  <span className='text-3xl font-headline font-bold text-[#aa8aff]'>24ms</span>
                </div>
                <div className='flex flex-col items-center justify-center space-y-1'>
                  <span className='text-xs uppercase tracking-widest text-slate-500'>{t('稳定性')}</span>
                  <span className='text-3xl font-headline font-bold text-[#ff59e3]'>99.99%</span>
                </div>
              </div>
            </div>
          </section>

          {/* 供应商图标 */}
          <section className='py-32 px-6 max-w-7xl mx-auto'>
            <div className='text-center mb-20 space-y-4'>
              <span className='text-[#8ff5ff] uppercase tracking-[0.3em] text-sm'>{t('生态系统')}</span>
              <h2 className='font-headline text-4xl md:text-5xl font-bold text-[#f7f5fd]'>{t('支持众多的大模型供应商')}</h2>
            </div>
            <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-12 max-w-5xl mx-auto'>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <Moonshot size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <OpenAI size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <XAI size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <Zhipu.Color size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <Claude.Color size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <Gemini.Color size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <DeepSeek.Color size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity'>
                <Qwen.Color size={isMobile ? 48 : 64} />
              </div>
              <div className='w-12 h-12 md:w-16 md:h-16 flex items-center justify-center'>
                <Typography.Text className='!text-2xl md:!text-3xl font-bold text-[#8ff5ff]'>
                  40+
                </Typography.Text>
              </div>
            </div>
          </section>

          {/* Developer Section - 代码示例展示 */}
          <section className='py-32 px-6 relative overflow-hidden'>
            <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16'>
              <div className='w-full lg:w-1/2 space-y-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='w-2 h-2 rounded-full bg-[#ff59e3] animate-pulse' />
                  <span className='text-[#ff59e3] text-sm uppercase tracking-widest'>{t('实时 API 同步')}</span>
                </div>
                <h2 className='font-headline text-4xl md:text-6xl font-bold tracking-tight text-[#f7f5fd]'>
                  {t('几行代码，即刻接入')}
                </h2>
                <p className='text-[#abaab1] text-lg'>
                  {t('兼容 OpenAI SDK，无需修改现有代码。只需替换 base_url，即可接入 40+ AI 模型。')}
                </p>
                <ul className='space-y-4 pt-4'>
                  <li className='flex items-center gap-3'>
                    <span className='text-[#8ff5ff] text-xl'>✓</span>
                    <span className='text-[#f7f5fd]'>{t('原生支持流式响应')}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <span className='text-[#8ff5ff] text-xl'>✓</span>
                    <span className='text-[#f7f5fd]'>{t('实时监控与调试')}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <span className='text-[#8ff5ff] text-xl'>✓</span>
                    <span className='text-[#f7f5fd]'>{t('自动故障转移')}</span>
                  </li>
                </ul>
              </div>
              
              <div className='w-full lg:w-1/2'>
                <div className='relative group'>
                  <div className='absolute -inset-1 bg-gradient-to-r from-[#8ff5ff] to-[#aa8aff] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000' />
                  <div className='relative bg-[#000000] rounded-xl overflow-hidden border border-[#47474e]/30'>
                    {/* Terminal Header */}
                    <div className='bg-[#24252d] px-6 py-3 flex items-center justify-between border-b border-[#47474e]/20'>
                      <div className='flex gap-2'>
                        <div className='w-3 h-3 rounded-full bg-[#ff716c]/40' />
                        <div className='w-3 h-3 rounded-full bg-[#844eff]/40' />
                        <div className='w-3 h-3 rounded-full bg-[#00deec]/40' />
                      </div>
                      <div className='text-xs text-slate-500 font-mono'>api_example.py</div>
                    </div>
                    {/* Terminal Content */}
                    <div className='p-6 md:p-8 font-mono text-sm leading-relaxed overflow-x-auto'>
                      <pre className='whitespace-pre'>
<span className='text-[#aa8aff]'>from</span> <span className='text-[#8ff5ff]'>openai</span> <span className='text-[#aa8aff]'>import</span> <span className='text-[#8ff5ff]'>OpenAI</span>
{'\n'}
<span className='text-[#75757b]'># 只需修改 base_url 和 api_key</span>
{'\n'}
<span className='text-[#f7f5fd]'>client</span> <span className='text-[#aa8aff]'>=</span> <span className='text-[#8ff5ff]'>OpenAI</span><span className='text-[#f7f5fd]'>(</span>
{'\n'}
{'  '}<span className='text-[#ff59e3]'>base_url</span><span className='text-[#aa8aff]'>=</span><span className='text-[#8ff5ff]'>"{serverAddress}/v1"</span><span className='text-[#f7f5fd]'>,</span>
{'\n'}
{'  '}<span className='text-[#ff59e3]'>api_key</span><span className='text-[#aa8aff]'>=</span><span className='text-[#8ff5ff]'>"your-api-key"</span>
{'\n'}
<span className='text-[#f7f5fd]'>)</span>
{'\n'}
{'\n'}
<span className='text-[#75757b]'># 调用任意模型</span>
{'\n'}
<span className='text-[#f7f5fd]'>response</span> <span className='text-[#aa8aff]'>=</span> <span className='text-[#f7f5fd]'>client</span><span className='text-[#aa8aff]'>.</span><span className='text-[#8ff5ff]'>chat</span><span className='text-[#aa8aff]'>.</span><span className='text-[#8ff5ff]'>completions</span><span className='text-[#aa8aff]'>.</span><span className='text-[#8ff5ff]'>create</span><span className='text-[#f7f5fd]'>(</span>
{'\n'}
{'  '}<span className='text-[#ff59e3]'>model</span><span className='text-[#aa8aff]'>=</span><span className='text-[#8ff5ff]'>"gpt-4"</span><span className='text-[#f7f5fd]'>,</span>
{'\n'}
{'  '}<span className='text-[#ff59e3]'>messages</span><span className='text-[#aa8aff]'>=</span><span className='text-[#f7f5fd]'>[</span>
{'\n'}
{'    '}<span className='text-[#f7f5fd]'>{'{'}</span>
{'\n'}
{'      '}<span className='text-[#ff59e3]'>"role"</span><span className='text-[#f7f5fd]'>:</span> <span className='text-[#8ff5ff]'>"user"</span><span className='text-[#f7f5fd]'>,</span>
{'\n'}
{'      '}<span className='text-[#ff59e3]'>"content"</span><span className='text-[#f7f5fd]'>:</span> <span className='text-[#8ff5ff]'>"Hello!"</span>
{'\n'}
{'    '}<span className='text-[#f7f5fd]'>{'}'}</span>
{'\n'}
{'  '}<span className='text-[#f7f5fd]'>]</span>
{'\n'}
<span className='text-[#f7f5fd]'>)</span>
{'\n'}
{'\n'}
<span className='text-[#aa8aff]'>print</span><span className='text-[#f7f5fd]'>(</span><span className='text-[#f7f5fd]'>response</span><span className='text-[#aa8aff]'>.</span><span className='text-[#8ff5ff]'>choices</span><span className='text-[#f7f5fd]'>[</span><span className='text-[#ff59e3]'>0</span><span className='text-[#f7f5fd]'>]</span><span className='text-[#aa8aff]'>.</span><span className='text-[#8ff5ff]'>message</span><span className='text-[#aa8aff]'>.</span><span className='text-[#8ff5ff]'>content</span><span className='text-[#f7f5fd]'>)</span>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - 行动号召 */}
          <section className='py-32 px-6'>
            <div className='max-w-4xl mx-auto glass-panel p-12 md:p-16 rounded-3xl text-center border border-[#8ff5ff]/20 relative overflow-hidden'>
              <div className='absolute -top-24 -left-24 w-64 h-64 bg-[#8ff5ff]/10 blur-[80px]' />
              <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-[#ff59e3]/10 blur-[80px]' />
              <div className='relative z-10'>
                <h2 className='font-headline text-3xl md:text-5xl font-bold mb-8 text-[#f7f5fd]'>
                  {t('准备好开始了吗？')}
                </h2>
                <p className='text-[#abaab1] text-lg mb-8 max-w-2xl mx-auto'>
                  {t('立即获取 API 密钥，开始使用统一的大模型接口网关')}
                </p>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    type='primary'
                    size='large'
                    className='!rounded-xl px-12 py-5 !bg-[#8ff5ff] !text-[#005d63] font-bold text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(143,245,255,0.2)]'
                  >
                    {t('立即开始')}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
