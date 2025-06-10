'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { shouldUseDarkTheme } from '@/lib/config';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  autoTheme: boolean;
  setAutoTheme: (auto: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
  autoTheme?: boolean;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light', 
  autoTheme = true 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);
  const [auto, setAuto] = useState(autoTheme);

  // 初始化主题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('homepage-theme');
      const savedAuto = localStorage.getItem('homepage-auto-theme');
      
      if (saved) {
        setTheme(saved as 'light' | 'dark');
      }
      
      if (savedAuto !== null) {
        setAuto(savedAuto === 'true');
      }
    }
  }, []);

  // 自动主题切换
  useEffect(() => {
    if (!auto) return;

    const updateTheme = () => {
      const shouldBeDark = shouldUseDarkTheme();
      setTheme(shouldBeDark ? 'dark' : 'light');
    };

    updateTheme();
    
    // 每分钟检查一次
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [auto]);

  // 应用主题到DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('homepage-theme', theme);
    }
  }, [theme]);

  // 保存自动主题设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('homepage-auto-theme', auto.toString());
    }
  }, [auto]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setAuto(false); // 手动切换时关闭自动模式
  };

  const setAutoTheme = (autoMode: boolean) => {
    setAuto(autoMode);
    if (autoMode) {
      const shouldBeDark = shouldUseDarkTheme();
      setTheme(shouldBeDark ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        autoTheme: auto, 
        setAutoTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
