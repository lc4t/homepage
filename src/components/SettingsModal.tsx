'use client';

import React from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      
      <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-[20px] border border-white/20 dark:border-white/10 rounded-2xl max-w-md w-full overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              主题设置
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 主题选择 */}
        <div className="p-6">
          <div className="space-y-3">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg transition-all
                ${theme === 'light' 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-yellow-400" />
                <div className="text-left">
                  <div className="text-white font-medium">浅色主题</div>
                  <div className="text-white/60 text-sm">适合白天使用</div>
                </div>
              </div>
              {theme === 'light' && (
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg transition-all
                ${theme === 'dark' 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">深色主题</div>
                  <div className="text-white/60 text-sm">适合夜晚使用</div>
                </div>
              </div>
              {theme === 'dark' && (
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
