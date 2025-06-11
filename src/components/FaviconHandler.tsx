'use client';

import { useEffect } from 'react';
import { SiteConfig } from '@/types/config';

interface FaviconHandlerProps {
  siteConfig: SiteConfig;
}

export function FaviconHandler({ siteConfig }: FaviconHandlerProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // 设置网站图标
    if (siteConfig.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = siteConfig.favicon;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = siteConfig.favicon;
        document.head.appendChild(newLink);
      }
    }
  }, [siteConfig.favicon]);

  return null;
} 