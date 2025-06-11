'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Github, Globe, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { SiteConfig } from '@/types/config';
import { IconComponent } from './IconComponent';
import Image from 'next/image';

interface HeaderProps {
  siteConfig: SiteConfig;
}

export function Header({ siteConfig }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    return theme === 'dark' 
      ? <Moon className="w-5 h-5" /> 
      : <Sun className="w-5 h-5" />;
  };

  const getThemeTitle = () => {
    return theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';
  };

  const themeButtonClass = mounted 
    ? 'p-3 rounded-xl backdrop-blur-[10px] border transition-all h-12 w-12 flex items-center justify-center'
    : 'p-3 rounded-xl backdrop-blur-[10px] border transition-all bg-white/10 border-white/20 h-12 w-12 flex items-center justify-center';

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
              <IconComponent
                icon={link.icon}
                title={link.name}
                url={link.url}
                size={20}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
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
        <div className="flex-1 mb-4 sm:mb-0 flex items-center">
          {/* 头像 */}
          {siteConfig.avatar && (
            <div className="mr-4 flex-shrink-0">
              <Image
                src={siteConfig.avatar}
                alt="Avatar"
                width={48}
                height={48}
                className="rounded-full"
                priority
              />
            </div>
          )}
          
          <div>
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
        </div>

        {/* 主题切换按钮 - 在移动端隐藏 */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={themeButtonClass}
            title={getThemeTitle()}
          >
            {getThemeIcon()}
          </button>
        </div>
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
