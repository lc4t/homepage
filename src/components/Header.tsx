'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Github, Globe, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { SiteConfig } from '@/types/config';

interface HeaderProps {
  siteConfig: SiteConfig;
}

export function Header({ siteConfig }: HeaderProps) {
  const { theme, toggleTheme, autoTheme, setAutoTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const themeButtonClass = mounted 
    ? `p-3 rounded-xl backdrop-blur-[10px] border transition-all ${
        autoTheme 
          ? 'bg-orange-500/20 border-orange-500/30 text-orange-200 hover:bg-orange-500/30' 
          : 'apple-card'
      }`
    : 'p-3 rounded-xl backdrop-blur-[10px] border transition-all bg-white/10 border-white/20';

  // 渲染个人链接图标
  const renderLinks = () => {
    if (!siteConfig.links) return null;
    
    return (
      <div className="flex items-center gap-2 ml-4">
        {siteConfig.links.github && (
          <a 
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        )}
        
        {siteConfig.links.blog && (
          <a 
            href={siteConfig.links.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            title="博客"
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        )}
        
        {siteConfig.links.custom?.map((link, index) => (
          <a 
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            title={link.name}
          >
            {link.icon ? (
              <span className="text-base sm:text-lg">{link.icon}</span>
            ) : (
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </a>
        ))}
      </div>
    );
  };

  return (
    <header className="relative z-20 p-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
        {/* 网站信息 */}
        <div className="flex-1 mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{color: 'var(--text-primary)'}}>
            {siteConfig.title}
          </h1>
          <div className="flex flex-wrap items-center">
            {siteConfig.description && (
              <p className="text-xs sm:text-sm mr-2" style={{color: 'var(--text-secondary)'}}>
                {siteConfig.description}
              </p>
            )}
            {renderLinks()}
          </div>
        </div>

        {/* 操作按钮 - 在移动端隐藏 */}
        <div className="hidden md:flex items-center gap-3">
          {/* 主题切换按钮 */}
          <button
            onClick={handleThemeClick}
            onContextMenu={handleThemeRightClick}
            className={themeButtonClass}
            title={getThemeTitle()}
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>

      {/* 主题提示 - 在移动端隐藏 */}
      {mounted && autoTheme && (
        <div className="absolute top-20 right-6 bg-orange-500/20 backdrop-blur-[10px] border border-orange-500/30 rounded-lg px-3 py-2 text-orange-200 text-sm hidden md:block">
          🌅 自动主题模式
        </div>
      )}
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <header className="relative z-20 p-4" style={{borderBottom: '1px solid var(--border-primary)'}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              style={{color: 'var(--text-primary)'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>
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
