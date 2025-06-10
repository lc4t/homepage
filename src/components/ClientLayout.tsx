'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 确保只在客户端渲染后执行
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 直接控制HTML元素的类名和属性
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const html = document.documentElement;
      
      // 同时设置class和data-theme属性
      if (theme === 'dark') {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [theme, mounted]);
  
  // 在服务器端或客户端首次渲染时，返回不带任何主题相关属性的内容
  if (!mounted) {
    return <>{children}</>;
  }
  
  // 客户端渲染后，使用内联样式确保主题正确应用
  return (
    <div data-theme={theme} className={theme === 'dark' ? 'dark' : ''}>
      {children}
    </div>
  );
} 