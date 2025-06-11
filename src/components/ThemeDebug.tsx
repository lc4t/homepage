'use client';

import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export function ThemeDebug() {
  const { theme, toggleTheme } = useTheme();
  const [hasDarkClass, setHasDarkClass] = useState(false);
  const [dataTheme, setDataTheme] = useState('');
  const [renderCount, setRenderCount] = useState(0);
  const [htmlClassName, setHtmlClassName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // 只在客户端执行的初始化
  useEffect(() => {
    setIsMounted(true);
    
    // 检查HTML元素是否有dark类
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      const dataThemeValue = document.documentElement.getAttribute('data-theme') || '';
      const className = document.documentElement.className;
      
      setHasDarkClass(isDark);
      setDataTheme(dataThemeValue);
      setHtmlClassName(className);
      setRenderCount(prev => prev + 1);
      
      console.log('ThemeDebug: 初始化', {
        theme,
        hasDarkClass: isDark,
        dataTheme: dataThemeValue,
        htmlClasses: className
      });
    }
  }, [theme]);
  
  // 当主题变化时更新状态
  useEffect(() => {
    if (!isMounted) return;
    
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      const dataThemeValue = document.documentElement.getAttribute('data-theme') || '';
      const className = document.documentElement.className;
      
      setHasDarkClass(isDark);
      setDataTheme(dataThemeValue);
      setHtmlClassName(className);
      setRenderCount(prev => prev + 1);
      
      console.log('ThemeDebug: 主题更新', {
        theme,
        hasDarkClass: isDark,
        dataTheme: dataThemeValue,
        htmlClasses: className
      });
    }
  }, [theme, isMounted]);
  
  useEffect(() => {
    console.log('Current theme:', theme);
  }, [theme]);
  
  const handleForceToggle = () => {
    if (!isMounted) return;
    
    // 手动切换HTML类
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      setHasDarkClass(false);
      setDataTheme('light');
      setHtmlClassName(document.documentElement.className);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      setHasDarkClass(true);
      setDataTheme('dark');
      setHtmlClassName(document.documentElement.className);
    }
  };
  
  const handleForceRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };
  
  // 如果未挂载，返回一个占位符
  if (!isMounted) {
    return (
      <div className="fixed bottom-4 right-4 bg-white/20 p-3 rounded-lg text-white text-xs z-50 backdrop-blur">
        加载中...
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white/20 dark:bg-black/30 p-3 rounded-lg text-white text-xs z-50 backdrop-blur">
      <div>当前主题: <strong>{theme}</strong></div>
      <div>HTML dark类: <strong>{hasDarkClass ? '是' : '否'}</strong></div>
      <div>data-theme: <strong>{dataTheme}</strong></div>
      <div>渲染次数: {renderCount}</div>
      <div>HTML类名: <span className="text-[10px]">{htmlClassName}</span></div>
      <div className="mt-1 text-[10px] opacity-70">
        <div className="dark:hidden">这段文字只在亮色主题显示</div>
        <div className="hidden dark:block">这段文字只在暗色主题显示</div>
      </div>
      <div className="mt-2 flex gap-2 flex-wrap">
        <button 
          onClick={toggleTheme}
          className="px-2 py-1 bg-blue-500/50 hover:bg-blue-500/70 rounded text-[10px]"
        >
          切换主题
        </button>
        <button 
          onClick={handleForceToggle}
          className="px-2 py-1 bg-red-500/50 hover:bg-red-500/70 rounded text-[10px]"
        >
          强制切换HTML类
        </button>
        <button 
          onClick={handleForceRefresh}
          className="px-2 py-1 bg-green-500/50 hover:bg-green-500/70 rounded text-[10px]"
        >
          强制刷新页面
        </button>
      </div>
    </div>
  );
} 