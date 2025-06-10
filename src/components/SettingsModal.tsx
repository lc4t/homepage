'use client';

import React, { useState } from 'react';
import { X, Download, Upload, Palette, Moon, Sun, Sunrise } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { BackgroundSelector } from './Background';
import { AppearanceConfig } from '@/types/config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: {
    appearance: AppearanceConfig;
  };
  onSaveConfig?: (config: any) => void;
}

export function SettingsModal({ isOpen, onClose, currentConfig, onSaveConfig }: SettingsModalProps) {
  const { theme, toggleTheme, autoTheme, setAutoTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'theme' | 'background' | 'export'>('theme');
  const [backgroundConfig, setBackgroundConfig] = useState(
    currentConfig?.appearance.background || {
      type: 'bing' as const,
      value: 'today',
      blur: 0,
      opacity: 0.8,
    }
  );

  if (!isOpen) return null;

  const handleExportConfig = () => {
    if (!currentConfig) return;
    
    const configText = `# 个人导航站配置文件
# 生成时间: ${new Date().toLocaleString()}

site:
  title: "我的导航站"
  description: "Personal Navigation Hub"
  author: "Your Name"

appearance:
  theme:
    auto: ${autoTheme}
    default: "${theme}"
  background:
    type: "${backgroundConfig.type}"
    value: "${backgroundConfig.value}"
    blur: ${backgroundConfig.blur}
    opacity: ${backgroundConfig.opacity}
  card:
    blur: 10
    opacity: 0.15

# 其他配置请手动添加...
`;

    const blob = new Blob([configText], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homepage-config-${new Date().toISOString().split('T')[0]}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          try {
            // 这里应该解析YAML并更新配置
            alert('配置导入功能需要重新加载页面才能生效。请将配置内容复制到 public/config/site.yaml 文件中。');
          } catch (error) {
            alert('配置文件格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const tabs = [
    { id: 'theme' as const, label: '主题设置', icon: <Palette className="w-4 h-4" /> },
    { id: 'background' as const, label: '背景设置', icon: <Sun className="w-4 h-4" /> },
    { id: 'export' as const, label: '导入导出', icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      
      <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-[20px] border border-white/20 dark:border-white/10 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              网站设置
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* 侧边栏 */}
          <div className="w-64 p-4 border-r border-white/10">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                    ${activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">主题模式</h3>
                  <div className="space-y-4">
                    {/* 自动主题 */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Sunrise className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-white font-medium">自动主题</div>
                          <div className="text-white/60 text-sm">根据时间自动切换深色/浅色主题</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoTheme(!autoTheme)}
                        className={`
                          relative w-12 h-6 rounded-full transition-all
                          ${autoTheme ? 'bg-orange-500' : 'bg-white/20'}
                        `}
                      >
                        <div
                          className={`
                            absolute w-5 h-5 bg-white rounded-full transition-all top-0.5
                            ${autoTheme ? 'left-6' : 'left-0.5'}
                          `}
                        />
                      </button>
                    </div>

                    {/* 手动主题选择 */}
                    {!autoTheme && (
                      <div className="space-y-3">
                        <button
                          onClick={() => theme === 'dark' && toggleTheme()}
                          className={`
                            w-full flex items-center justify-between p-4 rounded-lg transition-all
                            ${theme === 'light' 
                              ? 'bg-white/10 border border-white/20' 
                              : 'bg-white/5 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Sun className="w-5 h-5 text-yellow-400" />
                            <div className="text-left">
                              <div className="text-white font-medium">浅色主题</div>
                              <div className="text-white/60 text-sm">适合白天使用</div>
                            </div>
                          </div>
                          {theme === 'light' && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                          )}
                        </button>

                        <button
                          onClick={() => theme === 'light' && toggleTheme()}
                          className={`
                            w-full flex items-center justify-between p-4 rounded-lg transition-all
                            ${theme === 'dark' 
                              ? 'bg-white/10 border border-white/20' 
                              : 'bg-white/5 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Moon className="w-5 h-5 text-blue-400" />
                            <div className="text-left">
                              <div className="text-white font-medium">深色主题</div>
                              <div className="text-white/60 text-sm">适合夜晚使用</div>
                            </div>
                          </div>
                          {theme === 'dark' && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">背景设置</h3>
                  <BackgroundSelector 
                    current={backgroundConfig}
                    onChange={setBackgroundConfig}
                  />
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">配置管理</h3>
                  <div className="space-y-4">
                    <button
                      onClick={handleExportConfig}
                      className="w-full flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">导出配置</div>
                        <div className="text-sm opacity-80">下载当前网站配置文件</div>
                      </div>
                    </button>

                    <button
                      onClick={handleImportConfig}
                      className="w-full flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">导入配置</div>
                        <div className="text-sm opacity-80">上传并应用配置文件</div>
                      </div>
                    </button>

                    <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <div className="text-yellow-200 text-sm">
                        <strong>注意：</strong> 配置更改需要重新加载页面才能完全生效。建议在修改配置文件后使用浏览器刷新。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
