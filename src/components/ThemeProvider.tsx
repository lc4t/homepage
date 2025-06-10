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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('homepage-theme');
      const savedAuto = localStorage.getItem('homepage-auto-theme');
      
      if (saved && (saved === 'light' || saved === 'dark')) {
        console.log('ThemeProvider: 从localStorage加载主题', saved);
        setTheme(saved);
      }
      
      if (savedAuto !== null) {
        setAuto(savedAuto === 'true');
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('ThemeProvider: 初始化主题时出错', error);
    }
  }, []);

  useEffect(() => {
    if (!auto || !initialized) return;

    const updateTheme = () => {
      try {
        const shouldBeDark = shouldUseDarkTheme();
        console.log('ThemeProvider: 自动主题检测结果', shouldBeDark ? 'dark' : 'light');
        setTheme(shouldBeDark ? 'dark' : 'light');
      } catch (error) {
        console.error('ThemeProvider: 自动主题检测出错', error);
      }
    };

    updateTheme();
    
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [auto, initialized]);

  useEffect(() => {
    if (typeof window === 'undefined' || !initialized) return;
    
    try {
      localStorage.setItem('homepage-theme', theme);
      console.log('ThemeProvider: 主题已保存为', theme);
    } catch (error) {
      console.error('ThemeProvider: 保存主题时出错', error);
    }
  }, [theme, initialized]);

  useEffect(() => {
    if (typeof window === 'undefined' || !initialized) return;
    
    try {
      localStorage.setItem('homepage-auto-theme', auto.toString());
    } catch (error) {
      console.error('ThemeProvider: 保存自动主题设置时出错', error);
    }
  }, [auto, initialized]);

  const toggleTheme = () => {
    console.log('ThemeProvider: 手动切换主题', theme === 'light' ? 'dark' : 'light');
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setAuto(false);
  };

  const setAutoTheme = (autoMode: boolean) => {
    setAuto(autoMode);
    if (autoMode) {
      try {
        const shouldBeDark = shouldUseDarkTheme();
        setTheme(shouldBeDark ? 'dark' : 'light');
      } catch (error) {
        console.error('ThemeProvider: 设置自动主题时出错', error);
      }
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
