'use client';

import React, { useState, useEffect } from 'react';
import { IconConfig } from '@/types/config';
import Image from 'next/image';

interface IconProps {
  // 图标配置（推荐对象格式，兼容字符串路径）
  icon?: IconConfig | string;
  // 标题（用于生成首字母）
  title: string;
  // 网站URL（用于自动获取favicon）
  url?: string;
  // 项目类型（用于判断是否默认获取favicon）
  itemType?: string;
  // 图标大小
  size?: number;
  // CSS类名
  className?: string;
}

export function IconComponent({ 
  icon, 
  title, 
  url, 
  itemType,
  size = 32, 
  className = ''
}: IconProps) {
  const [imageError, setImageError] = useState(false);
  const [faviconAttempts, setFaviconAttempts] = useState<string[]>([]);
  const [currentFaviconIndex, setCurrentFaviconIndex] = useState(0);

  // 重置错误状态当icon改变时
  useEffect(() => {
    setImageError(false);
    setFaviconAttempts([]);
    setCurrentFaviconIndex(0);
  }, [icon, url]);

  // 判断是否应该默认尝试favicon（对于website/service类型且未配置icon）
  const shouldTryFavicon = (itemType === 'website' || itemType === 'service') && url && !icon;

  // 解析图标路径（只处理文件路径，自动添加/icons/前缀）
  const resolveIconPath = (path: string): string => {
    if (!path.startsWith('http') && !path.startsWith('/') && !path.startsWith('data:')) {
      return `/icons/${path}`;
    }
    return path;
  };

  // 统一处理图标配置
  const getIconConfig = (): IconConfig | undefined => {
    // 情况1: 没有图标配置但应该尝试favicon
    if (shouldTryFavicon) {
      return {
        type: 'favicon',
        value: undefined
      };
    }

    // 情况2: 没有图标配置
    if (!icon) {
      return undefined;
    }

    // 情况3: 字符串格式 - 作为路径处理
    if (typeof icon === 'string') {
      return {
        type: 'auto',
        value: resolveIconPath(icon)
      };
    }

    // 情况4: 对象格式 - 根据类型处理
    // emoji 和 text 类型不需要路径处理
    if (icon.type === 'emoji' || icon.type === 'text') {
      return icon; // 直接返回，保持原始值
    }
    
    // 其他类型需要路径处理
    return {
      ...icon,
      value: icon.value ? resolveIconPath(icon.value) : icon.value
    };
  };

  const iconConfig = getIconConfig();

  // 获取favicon URL列表（多个备选方案）
  const getFaviconUrls = (targetUrl: string): string[] => {
    try {
      const urlObj = new URL(targetUrl);
      const domain = urlObj.hostname;
      const origin = urlObj.origin;
      
      return [
        `${origin}/favicon.ico`,
        `https://icon.horse/icon/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        `${origin}/apple-touch-icon.png`,
        `${origin}/favicon.png`
      ];
    } catch {
      return [];
    }
  };

  // 生成Badge URL
  const generateBadgeUrl = (config: IconConfig): string => {
    const { badge } = config;
    if (!badge) return '';

    const style = badge.style || 'flat';
    const label = encodeURIComponent(badge.label || '');
    const message = encodeURIComponent(badge.message || title);
    const color = badge.color || 'blue';
    const labelColor = badge.labelColor || 'lightgrey';
    const logo = badge.logo || '';

    let url = `https://img.shields.io/badge/${label}`;
    if (label && message) {
      url += `-${message}`;
    } else if (message) {
      url = `https://img.shields.io/badge/${message}`;
    }
    url += `-${color}`;
    
    const params = new URLSearchParams();
    if (style !== 'flat') params.append('style', style);
    if (labelColor !== 'lightgrey') params.append('labelColor', labelColor);
    if (logo) params.append('logo', logo);

    const paramString = params.toString();
    return paramString ? `${url}?${paramString}` : url;
  };

  // 主渲染函数
  const renderIcon = (): React.ReactNode => {
    if (!iconConfig) {
      return renderFallback();
    }

    switch (iconConfig.type) {
      case 'emoji':
        return renderEmoji(iconConfig.value || '📄');
      
      case 'auto':
      case 'path':
      case 'url':
        return renderImage(iconConfig.value || '');
      
      case 'favicon':
        return renderFavicon();
      
      case 'svg':
        return renderSvg();
      
      case 'badge':
        return renderBadge();
      
      case 'text':
        return renderText(iconConfig.value || title.charAt(0));
      
      default:
        return renderFallback();
    }
  };

  // 渲染Emoji
  const renderEmoji = (emoji: string): React.ReactNode => {
    return (
      <div 
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 ${className}`}
        style={{ 
          width: size, 
          height: size, 
          fontSize: size * 0.5 
        }}
      >
        {emoji}
      </div>
    );
  };

  // 渲染图片/路径
  const renderImage = (imagePath: string): React.ReactNode => {
    if (imageError || !imagePath) {
      return renderFallback();
    }
    
    return (
      <Image
        src={imagePath}
        alt={title || 'Icon'}
        width={size}
        height={size}
        className={`rounded-lg object-cover ${className}`}
      />
    );
  };

  // 渲染favicon
  const renderFavicon = (): React.ReactNode => {
    if (!url || imageError) {
      return renderFallback();
    }

    let faviconUrl = '';
    if (faviconAttempts.length > 0 && currentFaviconIndex < faviconAttempts.length) {
      faviconUrl = faviconAttempts[currentFaviconIndex];
    } else if (iconConfig?.value) {
      faviconUrl = iconConfig.value;
    } else {
      const urls = getFaviconUrls(url);
      if (urls.length > 0) {
        faviconUrl = urls[0];
        setFaviconAttempts(urls);
        setCurrentFaviconIndex(0);
      }
    }

    if (!faviconUrl) {
      return renderFallback();
    }
    
    return (
      <Image
        src={faviconUrl}
        alt={title || 'Favicon'}
        width={size}
        height={size}
        className={`rounded-lg object-cover ${className}`}
      />
    );
  };

  // 渲染SVG
  const renderSvg = (): React.ReactNode => {
    // 直接的SVG内容
    if (iconConfig?.svg) {
      return (
        <div 
          className={`${className} flex items-center justify-center`}
          dangerouslySetInnerHTML={{ __html: iconConfig.svg }}
        />
      );
    }
    
    // SVG URL
    if (iconConfig?.value) {
      return renderImage(iconConfig.value);
    }
    
    return renderFallback();
  };

  // 渲染Badge
  const renderBadge = (): React.ReactNode => {
    const badgeUrl = generateBadgeUrl(iconConfig!);
    if (!badgeUrl || imageError) {
      return renderFallback();
    }
    
    return (
      <Image
        src={badgeUrl}
        alt={title}
        className={`rounded ${className}`}
        style={{ height: size * 0.6, maxWidth: size * 2 }}
      />
    );
  };

  // 渲染文本
  const renderText = (text: string): React.ReactNode => {
    const displayText = text ? text.charAt(0).toUpperCase() : title.charAt(0).toUpperCase();
    
    return (
      <div 
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold ${className}`}
        style={{ 
          width: size, 
          height: size, 
          fontSize: size * 0.4 
        }}
      >
        {displayText}
      </div>
    );
  };

  // 保底图标
  const renderFallback = (): React.ReactNode => {
    // 如果有配置的保底图标
    if (iconConfig?.fallback) {
      switch (iconConfig.fallback.type) {
        case 'emoji':
          return renderEmoji(iconConfig.fallback.value);
        case 'text':
          return renderText(iconConfig.fallback.value);
        default:
          break;
      }
    }

    // 默认保底：使用首字母
    return renderText(title.charAt(0).toUpperCase());
  };

  return renderIcon();
}

// 导出辅助函数
export const IconUtils = {
  // 生成自动配置
  createAuto: (value: string, fallback?: { type: 'emoji' | 'text'; value: string }): IconConfig => ({
    type: 'auto',
    value,
    fallback
  }),

  // 生成Emoji配置
  createEmoji: (emoji: string): IconConfig => ({
    type: 'emoji',
    value: emoji
  }),

  // 生成路径配置
  createPath: (path: string): IconConfig => ({
    type: 'path',
    value: path
  }),

  // 生成URL配置
  createUrl: (url: string): IconConfig => ({
    type: 'url',
    value: url
  }),

  // 生成文本配置
  createText: (text: string): IconConfig => ({
    type: 'text',
    value: text
  }),

  // 生成Badge配置
  createBadge: (options: {
    label?: string;
    message: string;
    color?: string;
    style?: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social';
    logo?: string;
  }): IconConfig => ({
    type: 'badge',
    badge: options
  }),

  // 生成SVG配置
  createSvg: (svg: string): IconConfig => ({
    type: 'svg',
    svg
  }),

  // 生成Favicon配置
  createFavicon: (url?: string): IconConfig => ({
    type: 'favicon',
    value: url
  })
};
