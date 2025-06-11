'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
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
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light'
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('homepage-theme');
      
      if (saved && (saved === 'light' || saved === 'dark')) {
        console.log('ThemeProvider: 从localStorage加载主题', saved);
        setTheme(saved);
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('ThemeProvider: 初始化主题时出错', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !initialized) return;
    
    try {
      localStorage.setItem('homepage-theme', theme);
      console.log('ThemeProvider: 主题已保存为', theme);
    } catch (error) {
      console.error('ThemeProvider: 保存主题时出错', error);
    }
  }, [theme, initialized]);

  const toggleTheme = () => {
    console.log('ThemeProvider: 手动切换主题', theme === 'light' ? 'dark' : 'light');
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
