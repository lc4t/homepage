'use client';

import React from 'react';
import { Sun, Moon, Sunrise } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { SiteConfig } from '@/types/config';

interface HeaderProps {
  siteConfig: SiteConfig;
}

export function Header({ siteConfig }: HeaderProps) {
  const { theme, toggleTheme, autoTheme, setAutoTheme } = useTheme();

  const getThemeIcon = () => {
    if (autoTheme) {
      return <Sunrise className="w-5 h-5" />;
    }
    return theme === 'dark' 
      ? <Moon className="w-5 h-5" /> 
      : <Sun className="w-5 h-5" />;
  };

  const getThemeTitle = () => {
    if (autoTheme) {
      return '自动主题 (根据时间)';
    }
    return theme === 'dark' ? '深色主题' : '浅色主题';
  };

  const handleThemeClick = () => {
    if (autoTheme) {
      // 如果是自动模式，切换到手动模式
      setAutoTheme(false);
    } else {
      // 手动切换主题
      toggleTheme();
    }
  };

  const handleThemeRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 右键点击切换自动模式
    setAutoTheme(!autoTheme);
  };

  return (
    <header className="relative z-20 p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* 网站信息 */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">
            {siteConfig.title}
          </h1>
          {siteConfig.description && (
            <p className="text-white/80 dark:text-white/90 text-sm drop-shadow">
              {siteConfig.description}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          {/* 主题切换按钮 */}
          <button
            onClick={handleThemeClick}
            onContextMenu={handleThemeRightClick}
            className={`
              p-3 rounded-xl backdrop-blur-[10px] border transition-all
              ${autoTheme 
                ? 'bg-orange-500/20 border-orange-500/30 text-orange-200 hover:bg-orange-500/30' 
                : 'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-white hover:bg-white/20 dark:hover:bg-white/10'
              }
            `}
            title={getThemeTitle()}
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>

      {/* 主题提示 */}
      {autoTheme && (
        <div className="absolute top-20 right-6 bg-orange-500/20 backdrop-blur-[10px] border border-orange-500/30 rounded-lg px-3 py-2 text-orange-200 text-sm">
          🌅 自动主题模式
        </div>
      )}
      
      {/* 当前主题状态显示 */}
      <div className="absolute top-2 right-2 bg-blue-500/30 backdrop-blur-[10px] border border-blue-500/50 rounded px-2 py-1 text-blue-200 text-xs">
        {theme === 'dark' ? '🌙 深色' : '☀️ 浅色'}
      </div>
    </header>
  );
}

// 简化版头部（用于嵌入或特殊页面）
interface SimpleHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function SimpleHeader({ title, onBack, actions }: SimpleHeaderProps) {
  return (
    <header className="relative z-20 p-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-semibold text-white">
            {title}
          </h1>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
