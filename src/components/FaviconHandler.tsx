'use client';

import { useEffect, useState } from 'react';
import { loadConfig } from '@/lib/config';

export function FaviconHandler() {
  const [favicon, setFavicon] = useState<string | null>(null);
  
  // 加载配置获取favicon
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const config = await loadConfig();
        if (config.site.favicon) {
          setFavicon(config.site.favicon);
          
          // 动态设置favicon
          const linkElements = document.querySelectorAll("link[rel*='icon']");
          
          // 如果已存在favicon链接，则更新它
          if (linkElements.length > 0) {
            linkElements.forEach(el => {
              (el as HTMLLinkElement).href = config.site.favicon || '';
            });
          } else {
            // 否则创建一个新的
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = config.site.favicon;
            document.head.appendChild(link);
          }
        }
      } catch (error) {
        console.error("加载favicon配置失败:", error);
      }
    };

    loadFavicon();
  }, []);
  
  // 这个组件不渲染任何内容
  return null;
} 