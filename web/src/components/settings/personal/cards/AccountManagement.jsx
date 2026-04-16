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
  Button,
  Card,
  Input,
  Space,
  Typography,
  Avatar,
  Tabs,
  TabPane,
  Popover,
  Modal,
} from '@douyinfe/semi-ui';
import {
  IconMail,
  IconShield,
  IconGithubLogo,
  IconKey,
  IconLock,
  IconDelete,
} from '@douyinfe/semi-icons';
import { SiTelegram, SiWechat, SiLinux, SiDiscord } from 'react-icons/si';
import { UserPlus, ShieldCheck } from 'lucide-react';
import TelegramLoginButton from 'react-telegram-login';
import {
  API,
  showError,
  showSuccess,
  onGitHubOAuthClicked,
  onOIDCClicked,
  onLinuxDOOAuthClicked,
  onDiscordOAuthClicked,
  onCustomOAuthClicked,
  getOAuthProviderIcon,
} from '../../../../helpers';
import TwoFASetting from '../components/TwoFASetting';

const AccountManagement = ({
  t,
  userState,
  status,
  systemToken,
  setShowEmailBindModal,
  setShowWeChatBindModal,
  generateAccessToken,
  handleSystemTokenClick,
  setShowChangePasswordModal,
  setShowAccountDeleteModal,
  passkeyStatus,
  passkeySupported,
  passkeyRegisterLoading,
  passkeyDeleteLoading,
  onPasskeyRegister,
  onPasskeyDelete,
}) => {
  const renderAccountInfo = (accountId, label) => {
    if (!accountId || accountId === '') {
      return <span className='text-gray-500'>{t('未绑定')}</span>;
    }

    const popContent = (
      <div className='text-xs p-2'>
        <Typography.Paragraph copyable={{ content: accountId }}>
          {accountId}
        </Typography.Paragraph>
        {label ? (
          <div className='mt-1 text-[11px] text-gray-500'>{label}</div>
        ) : null}
      </div>
    );

    return (
      <Popover content={popContent} position='top' trigger='hover'>
        <span className='block max-w-full truncate text-gray-600 hover:text-blue-600 cursor-pointer'>
          {accountId}
        </span>
      </Popover>
    );
  };
  const isBound = (accountId) => Boolean(accountId);
  const [showTelegramBindModal, setShowTelegramBindModal] =
    React.useState(false);
  const [customOAuthBindings, setCustomOAuthBindings] = React.useState([]);
  const [customOAuthLoading, setCustomOAuthLoading] = React.useState({});

  // Fetch custom OAuth bindings
  const loadCustomOAuthBindings = async () => {
    try {
      const res = await API.get('/api/user/oauth/bindings');
      if (res.data.success) {
        setCustomOAuthBindings(res.data.data || []);
      } else {
        showError(res.data.message || t('获取绑定信息失败'));
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || t('获取绑定信息失败'));
    }
  };

  // Unbind custom OAuth provider
  const handleUnbindCustomOAuth = async (providerId, providerName) => {
    Modal.confirm({
      title: t('确认解绑'),
      content: t('确定要解绑 {{name}} 吗？', { name: providerName }),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: async () => {
        setCustomOAuthLoading((prev) => ({ ...prev, [providerId]: true }));
        try {
          const res = await API.delete(`/api/user/oauth/bindings/${providerId}`);
          if (res.data.success) {
            showSuccess(t('解绑成功'));
            await loadCustomOAuthBindings();
          } else {
            showError(res.data.message);
          }
        } catch (error) {
          showError(error.response?.data?.message || error.message || t('操作失败'));
        } finally {
          setCustomOAuthLoading((prev) => ({ ...prev, [providerId]: false }));
        }
      },
    });
  };

  // Handle bind custom OAuth
  const handleBindCustomOAuth = (provider) => {
    onCustomOAuthClicked(provider);
  };

  // Check if custom OAuth provider is bound
  const isCustomOAuthBound = (providerId) => {
    const normalizedId = Number(providerId);
    return customOAuthBindings.some((b) => Number(b.provider_id) === normalizedId);
  };

  // Get binding info for a provider
  const getCustomOAuthBinding = (providerId) => {
    const normalizedId = Number(providerId);
    return customOAuthBindings.find((b) => Number(b.provider_id) === normalizedId);
  };

  React.useEffect(() => {
    loadCustomOAuthBindings();
  }, []);

  const passkeyEnabled = passkeyStatus?.enabled;
  const lastUsedLabel = passkeyStatus?.last_used_at
    ? new Date(passkeyStatus.last_used_at).toLocaleString()
    : t('尚未使用');

  return (
    <div className='overflow-hidden' style={{
      background: 'rgba(18, 19, 25, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(143, 245, 255, 0.05)',
      borderRadius: '24px',
    }}>
      {/* 卡片头部 */}
      <div className='flex items-center p-6 border-b' style={{
        borderColor: 'rgba(143, 245, 255, 0.05)',
      }}>
        <div className='w-1 h-4 rounded-full mr-3' style={{ background: '#8ff5ff' }}></div>
        <div>
          <Typography.Text className='text-lg font-medium' style={{
            color: '#f7f5fd',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            {t('账户绑定')}
          </Typography.Text>
          <div className='text-xs' style={{
            color: '#abaab1',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            {t('账户绑定、安全设置和身份验证')}
          </div>
        </div>
      </div>

      <Tabs type='card' defaultActiveKey='binding' style={{
        '--semi-color-bg-0': 'transparent',
        '--semi-color-bg-1': 'rgba(24, 25, 32, 0.6)',
        '--semi-color-border': 'rgba(143, 245, 255, 0.1)',
        '--semi-color-text-0': '#f7f5fd',
        '--semi-color-text-1': '#abaab1',
      }}>
        {/* 账户绑定 Tab */}
        <TabPane
          tab={
            <div className='flex items-center' style={{
              fontFamily: 'Space Grotesk, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '12px',
            }}>
              <UserPlus size={16} className='mr-2' />
              {t('账户绑定')}
            </div>
          }
          itemKey='binding'
        >
          <div className='py-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {/* 邮箱绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <IconMail size='default' style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('邮箱中继')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {renderAccountInfo(userState.user?.email, t('邮箱地址'))}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      onClick={() => setShowEmailBindModal(true)}
                      style={{
                        background: isBound(userState.user?.email) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {isBound(userState.user?.email) ? t('已绑定') : t('建立')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 微信绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <SiWechat size={20} style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('微信链接')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {!status.wechat_login
                          ? t('未启用')
                          : isBound(userState.user?.wechat_id)
                            ? t('已绑定')
                            : t('未绑定')}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      disabled={!status.wechat_login}
                      onClick={() => setShowWeChatBindModal(true)}
                      style={{
                        background: isBound(userState.user?.wechat_id) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        opacity: !status.wechat_login ? 0.5 : 1,
                      }}
                    >
                      {isBound(userState.user?.wechat_id)
                        ? t('已绑定')
                        : status.wechat_login
                          ? t('建立')
                          : t('未启用')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* GitHub绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <IconGithubLogo size='default' style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('GitHub门户')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {renderAccountInfo(userState.user?.github_id, t('GitHub ID'))}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      onClick={() => onGitHubOAuthClicked(status.github_client_id)}
                      disabled={isBound(userState.user?.github_id) || !status.github_oauth}
                      style={{
                        background: isBound(userState.user?.github_id) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        opacity: (isBound(userState.user?.github_id) || !status.github_oauth) ? 0.5 : 1,
                      }}
                    >
                      {isBound(userState.user?.github_id) ? t('已绑定') : (status.github_oauth ? t('建立') : t('未启用'))}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Discord绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <SiDiscord size={20} style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('Discord中继')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {renderAccountInfo(userState.user?.discord_id, t('Discord ID'))}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      onClick={() => onDiscordOAuthClicked(status.discord_client_id)}
                      disabled={isBound(userState.user?.discord_id) || !status.discord_oauth}
                      style={{
                        background: isBound(userState.user?.discord_id) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        opacity: (isBound(userState.user?.discord_id) || !status.discord_oauth) ? 0.5 : 1,
                      }}
                    >
                      {isBound(userState.user?.discord_id) ? t('已绑定') : (status.discord_oauth ? t('建立') : t('未启用'))}
                    </Button>
                  </div>
                </div>
              </div>

              {/* OIDC绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <IconShield size='default' style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('OIDC认证')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {renderAccountInfo(userState.user?.oidc_id, t('OIDC ID'))}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      onClick={() => onOIDCClicked(status.oidc_authorization_endpoint, status.oidc_client_id)}
                      disabled={isBound(userState.user?.oidc_id) || !status.oidc_enabled}
                      style={{
                        background: isBound(userState.user?.oidc_id) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        opacity: (isBound(userState.user?.oidc_id) || !status.oidc_enabled) ? 0.5 : 1,
                      }}
                    >
                      {isBound(userState.user?.oidc_id) ? t('已绑定') : (status.oidc_enabled ? t('建立') : t('未启用'))}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Telegram绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <SiTelegram size={20} style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('Telegram')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {renderAccountInfo(userState.user?.telegram_id, t('Telegram ID'))}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      disabled={!status.telegram_oauth || isBound(userState.user?.telegram_id)}
                      onClick={() => setShowTelegramBindModal(true)}
                      style={{
                        background: isBound(userState.user?.telegram_id) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        opacity: (!status.telegram_oauth || isBound(userState.user?.telegram_id)) ? 0.5 : 1,
                      }}
                    >
                      {isBound(userState.user?.telegram_id) ? t('已绑定') : (status.telegram_oauth ? t('建立') : t('未启用'))}
                    </Button>
                  </div>
                </div>
              </div>
              <Modal
                title={t('绑定 Telegram')}
                visible={showTelegramBindModal}
                onCancel={() => setShowTelegramBindModal(false)}
                footer={null}
              >
                <div className='my-3 text-sm text-gray-600'>
                  {t('点击下方按钮通过 Telegram 完成绑定')}
                </div>
                <div className='flex justify-center'>
                  <div className='scale-90'>
                    <TelegramLoginButton
                      dataAuthUrl='/api/oauth/telegram/bind'
                      botName={status.telegram_bot_name}
                    />
                  </div>
                </div>
              </Modal>

              {/* LinuxDO绑定 */}
              <div className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <SiLinux size={20} style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('LinuxDO')}
                      </div>
                      <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                        {renderAccountInfo(userState.user?.linux_do_id, t('LinuxDO ID'))}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='small'
                      onClick={() => onLinuxDOOAuthClicked(status.linuxdo_client_id)}
                      disabled={isBound(userState.user?.linux_do_id) || !status.linuxdo_oauth}
                      style={{
                        background: isBound(userState.user?.linux_do_id) ? 'rgba(143, 245, 255, 0.1)' : 'transparent',
                        border: '1px solid rgba(143, 245, 255, 0.3)',
                        color: '#8ff5ff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        opacity: (isBound(userState.user?.linux_do_id) || !status.linuxdo_oauth) ? 0.5 : 1,
                      }}
                    >
                      {isBound(userState.user?.linux_do_id) ? t('已绑定') : (status.linuxdo_oauth ? t('建立') : t('未启用'))}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 自定义 OAuth 提供商绑定 */}
              {status.custom_oauth_providers &&
                status.custom_oauth_providers.map((provider) => {
                  const bound = isCustomOAuthBound(provider.id);
                  const binding = getCustomOAuthBinding(provider.id);
                  return (
                    <div key={provider.slug} className='p-3 rounded-lg transition-all hover:translate-x-1' style={{
                      background: 'rgba(24, 25, 32, 0.6)',
                      border: '1px solid rgba(143, 245, 255, 0.1)',
                    }}>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center flex-1 min-w-0'>
                          <div className='w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0' style={{
                            background: 'rgba(143, 245, 255, 0.1)',
                          }}>
                            {getOAuthProviderIcon(
                              provider.icon || binding?.provider_icon || '',
                              20,
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='font-medium' style={{
                              color: '#f7f5fd',
                              fontFamily: 'Space Grotesk, sans-serif',
                            }}>
                              {provider.name}
                            </div>
                            <div className='text-sm truncate' style={{ color: '#abaab1' }}>
                              {bound
                                ? renderAccountInfo(
                                    binding?.provider_user_id,
                                    t('{{name}} ID', { name: provider.name }),
                                  )
                                : t('未绑定')}
                            </div>
                          </div>
                        </div>
                        <div className='flex-shrink-0'>
                          {bound ? (
                            <Button
                              size='small'
                              loading={customOAuthLoading[provider.id]}
                              onClick={() =>
                                handleUnbindCustomOAuth(provider.id, provider.name)
                              }
                              style={{
                                background: 'rgba(255, 113, 108, 0.1)',
                                border: '1px solid rgba(255, 113, 108, 0.3)',
                                color: '#ff716c',
                                fontFamily: 'Space Grotesk, sans-serif',
                                textTransform: 'uppercase',
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                              }}
                            >
                              {t('解绑')}
                            </Button>
                          ) : (
                            <Button
                              size='small'
                              onClick={() => handleBindCustomOAuth(provider)}
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(143, 245, 255, 0.3)',
                                color: '#8ff5ff',
                                fontFamily: 'Space Grotesk, sans-serif',
                                textTransform: 'uppercase',
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                              }}
                            >
                              {t('建立')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </TabPane>

        {/* 安全设置 Tab */}
        <TabPane
          tab={
            <div className='flex items-center' style={{
              fontFamily: 'Space Grotesk, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '12px',
            }}>
              <ShieldCheck size={16} className='mr-2' />
              {t('安全设置')}
            </div>
          }
          itemKey='security'
        >
          <div className='py-4 px-6'>
            <div className='space-y-4'>
              {/* 系统访问令牌 */}
              <div className='p-4 rounded-lg' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(143, 245, 255, 0.1)',
              }}>
                <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                  <div className='flex items-start w-full sm:w-auto'>
                    <div className='w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0' style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                    }}>
                      <IconKey size='large' style={{ color: '#8ff5ff' }} />
                    </div>
                    <div className='flex-1'>
                      <Typography.Title heading={6} className='mb-1' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('系统访问令牌')}
                      </Typography.Title>
                      <Typography.Text type='tertiary' className='text-sm' style={{
                        color: '#abaab1',
                      }}>
                        {t('用于API调用的身份验证令牌，请妥善保管')}
                      </Typography.Text>
                      {systemToken && (
                        <div className='mt-3'>
                          <Input
                            readonly
                            value={systemToken}
                            onClick={handleSystemTokenClick}
                            size='large'
                            prefix={<IconKey style={{ color: '#8ff5ff' }} />}
                            style={{
                              background: 'rgba(24, 25, 32, 0.8)',
                              border: '1px solid rgba(143, 245, 255, 0.3)',
                              color: '#8ff5ff',
                              fontFamily: 'monospace',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={generateAccessToken}
                    icon={<IconKey />}
                    style={{
                      background: 'rgba(143, 245, 255, 0.1)',
                      border: '1px solid rgba(143, 245, 255, 0.3)',
                      color: '#8ff5ff',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      minWidth: '120px',
                    }}
                  >
                    {systemToken ? t('重新生成') : t('生成令牌')}
                  </Button>
                </div>
              </div>

              {/* 密码管理 */}
              <div className='p-4 rounded-lg' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(170, 138, 255, 0.1)',
              }}>
                <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                  <div className='flex items-start w-full sm:w-auto'>
                    <div className='w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0' style={{
                      background: 'rgba(170, 138, 255, 0.1)',
                    }}>
                      <IconLock size='large' style={{ color: '#aa8aff' }} />
                    </div>
                    <div>
                      <Typography.Title heading={6} className='mb-1' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('密码管理')}
                      </Typography.Title>
                      <Typography.Text type='tertiary' className='text-sm' style={{
                        color: '#abaab1',
                      }}>
                        {t('定期更改密码可以提高账户安全性')}
                      </Typography.Text>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowChangePasswordModal(true)}
                    icon={<IconLock />}
                    style={{
                      background: 'rgba(170, 138, 255, 0.1)',
                      border: '1px solid rgba(170, 138, 255, 0.3)',
                      color: '#aa8aff',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      minWidth: '120px',
                    }}
                  >
                    {t('修改密码')}
                  </Button>
                </div>
              </div>

              {/* Passkey 设置 */}
              <div className='p-4 rounded-lg' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(255, 89, 227, 0.1)',
              }}>
                <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                  <div className='flex items-start w-full sm:w-auto'>
                    <div className='w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0' style={{
                      background: 'rgba(255, 89, 227, 0.1)',
                    }}>
                      <IconKey size='large' style={{ color: '#ff59e3' }} />
                    </div>
                    <div>
                      <Typography.Title heading={6} className='mb-1' style={{
                        color: '#f7f5fd',
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}>
                        {t('Passkey 登录')}
                      </Typography.Title>
                      <Typography.Text type='tertiary' className='text-sm' style={{
                        color: '#abaab1',
                      }}>
                        {passkeyEnabled
                          ? t('已启用 Passkey，无需密码即可登录')
                          : t('使用 Passkey 实现免密且更安全的登录体验')}
                      </Typography.Text>
                      <div className='mt-2 text-xs space-y-1' style={{ color: '#75757b' }}>
                        <div>
                          {t('最后使用时间')}：{lastUsedLabel}
                        </div>
                        {!passkeySupported && (
                          <div style={{ color: '#ff716c' }}>
                            {t('当前设备不支持 Passkey')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={
                      passkeyEnabled
                        ? () => {
                            Modal.confirm({
                              title: t('确认解绑 Passkey'),
                              content: t(
                                '解绑后将无法使用 Passkey 登录，确定要继续吗？',
                              ),
                              okText: t('确认解绑'),
                              cancelText: t('取消'),
                              okType: 'danger',
                              onOk: onPasskeyDelete,
                            });
                          }
                        : onPasskeyRegister
                    }
                    icon={<IconKey />}
                    disabled={!passkeySupported && !passkeyEnabled}
                    loading={
                      passkeyEnabled
                        ? passkeyDeleteLoading
                        : passkeyRegisterLoading
                    }
                    style={{
                      background: passkeyEnabled ? 'rgba(255, 113, 108, 0.1)' : 'rgba(255, 89, 227, 0.1)',
                      border: passkeyEnabled ? '1px solid rgba(255, 113, 108, 0.3)' : '1px solid rgba(255, 89, 227, 0.3)',
                      color: passkeyEnabled ? '#ff716c' : '#ff59e3',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      minWidth: '120px',
                      opacity: (!passkeySupported && !passkeyEnabled) ? 0.5 : 1,
                    }}
                  >
                    {passkeyEnabled ? t('解绑 Passkey') : t('注册 Passkey')}
                  </Button>
                </div>
              </div>

              {/* 两步验证设置 */}
              <TwoFASetting t={t} />

              {/* 危险区域 */}
              <div className='p-4 rounded-lg' style={{
                background: 'rgba(24, 25, 32, 0.6)',
                border: '1px solid rgba(255, 113, 108, 0.1)',
              }}>
                <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                  <div className='flex items-start w-full sm:w-auto'>
                    <div className='w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0' style={{
                      background: 'rgba(255, 113, 108, 0.1)',
                    }}>
                      <IconDelete size='large' style={{ color: '#ff716c' }} />
                    </div>
                    <div>
                      <Typography.Title
                        heading={6}
                        className='mb-1'
                        style={{
                          color: '#ff716c',
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}
                      >
                        {t('删除账户')}
                      </Typography.Title>
                      <Typography.Text type='tertiary' className='text-sm' style={{
                        color: '#abaab1',
                      }}>
                        {t('此操作不可逆，所有数据将被永久删除')}
                      </Typography.Text>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAccountDeleteModal(true)}
                    icon={<IconDelete />}
                    style={{
                      background: 'rgba(255, 113, 108, 0.1)',
                      border: '1px solid rgba(255, 113, 108, 0.3)',
                      color: '#ff716c',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      minWidth: '120px',
                    }}
                  >
                    {t('删除账户')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AccountManagement;
