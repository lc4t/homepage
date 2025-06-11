'use client';

import React, { useEffect, useState } from 'react';
import { AppearanceConfig } from '@/types/config';
import { useTheme } from './ThemeProvider';

interface BackgroundProps {
  config: AppearanceConfig['background'];
  onLoaded?: () => void;
}

export function Background({ config, onLoaded }: BackgroundProps) {
  const { theme } = useTheme();
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 客户端挂载检测
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadBackground = async () => {
      let url = '';
      setUseFallback(false);

      switch (config.type) {
        case 'bing':
          // 使用第三方服务获取Bing每日壁纸
          url = 'https://bing.img.run/1920x1080.php';
          break;
        case 'url':
          url = config.value;
          break;
        case 'image':
          url = config.value;
          break;
        case 'color':
          // 纯色背景不需要图片URL
          setIsLoaded(true);
          onLoaded?.();
          return;
        default:
          // 默认使用渐变背景
          setUseFallback(true);
          setIsLoaded(true);
          onLoaded?.();
          return;
      }

      if (url) {
        // 预加载图片
        const img = new Image();
        img.onload = () => {
          setBackgroundUrl(url);
          setIsLoaded(true);
          onLoaded?.();
        };
        img.onerror = () => {
          // 图片加载失败，使用备用渐变背景
          console.error('图片加载失败:', url);
          setUseFallback(true);
          setIsLoaded(true);
          onLoaded?.();
        };
        img.src = url;
      } else {
        setUseFallback(true);
        setIsLoaded(true);
        onLoaded?.();
      }
    };

    if (mounted) {
      loadBackground();
    }
  }, [config, mounted, onLoaded]);

  const getBackgroundStyle = () => {
    if (useFallback) {
      // 备用渐变背景 - 根据主题使用不同的渐变
      return theme === 'dark'
        ? { background: 'linear-gradient(-45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }
        : { background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 100%)' };
    }

    if (config.type === 'color') {
      return {
        backgroundColor: config.value,
      };
    }

    if (backgroundUrl) {
      return {
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    // 默认渐变背景（备用方案）- 根据主题使用不同的渐变
    return theme === 'dark'
      ? { background: 'linear-gradient(-45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }
      : { background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 100%)' };
  };

  // 根据主题调整背景遮罩颜色
  const getOverlayStyle = () => {
    const baseOpacity = 1 - config.opacity;
    
    return {
      backgroundColor: theme === 'dark' 
        ? `rgba(0, 0, 0, ${baseOpacity + 0.2})` // 暗色主题增加黑色遮罩
        : `rgba(0, 0, 0, ${baseOpacity})`, // 亮色主题正常黑色遮罩
      backdropFilter: config.blur > 0 ? `blur(${config.blur}px)` : 'none',
    };
  };

  return (
    <>
      {/* 主背景 */}
      <div 
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          ...getBackgroundStyle(),
          opacity: isLoaded ? 1 : 0,
        }}
      />
      
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 transition-all duration-500"
        style={getOverlayStyle()}
      />
      
      {/* 加载状态 - 默认渐变背景 */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-pulse" />
      )}
    </>
  );
}

// 预设背景配置
export const BACKGROUND_PRESETS = {
  colors: [
    '#667eea', // 蓝紫色
    '#764ba2', // 紫色
    '#f093fb', // 粉色
    '#f5576c', // 红色
    '#4facfe', // 蓝色
    '#00f2fe', // 青色
    '#1a1a2e', // 深蓝色 (暗色主题)
    '#16213e', // 深蓝紫色 (暗色主题)
    '#0f3460', // 深蓝色 (暗色主题)
    '#1f1f1f', // 深灰色 (暗色主题)
  ],
};

// 背景选择器组件（用于设置页面）
interface BackgroundSelectorProps {
  current: AppearanceConfig['background'];
  onChange: (config: AppearanceConfig['background']) => void;
}

export function BackgroundSelector({ current, onChange }: BackgroundSelectorProps) {
  const { theme } = useTheme();
  const [customValue, setCustomValue] = useState(current.value);
  
  const handleTypeChange = (type: AppearanceConfig['background']['type']) => {
    let defaultValue = '';
    
    switch (type) {
      case 'bing':
        defaultValue = 'today';
        break;
      case 'color':
        defaultValue = theme === 'dark' ? '#1a1a2e' : '#667eea';
        break;
      case 'url':
      case 'image':
        defaultValue = '';
        break;
    }

    onChange({
      ...current,
      type,
      value: defaultValue,
    });
    setCustomValue(defaultValue);
  };

  const handleValueChange = (value: string) => {
    setCustomValue(value);
    onChange({
      ...current,
      value,
    });
  };

  return (
    <div className="space-y-4">
      {/* 背景类型选择 */}
      <div className="flex gap-2 flex-wrap">
        {(['bing', 'color', 'url', 'image'] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className="px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              backgroundColor: current.type === type ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              color: current.type === type ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            {type === 'bing' && 'Bing今日图片'}
            {type === 'color' && '纯色背景'}
            {type === 'url' && '网络图片'}
            {type === 'image' && '本地图片'}
          </button>
        ))}
      </div>

      {/* 值输入 */}
      <div>
        <input
          type="text"
          value={customValue}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={
            current.type === 'color' ? '输入颜色值，如: #667eea' :
            current.type === 'url' ? '输入图片URL' :
            '输入图片路径'
          }
          className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-primary)'
          }}
          disabled={current.type === 'bing'}
        />
      </div>

      {/* 预设选项 */}
      {current.type === 'bing' && (
        <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
          <div style={{color: 'var(--text-secondary)'}}>使用Bing今日壁纸，无需设置参数</div>
        </div>
      )}

      {current.type === 'color' && (
        <div className="space-y-2">
          <div className="text-sm" style={{color: 'var(--text-secondary)'}}>颜色预设:</div>
          <div className="flex gap-2 flex-wrap">
            {BACKGROUND_PRESETS.colors.map((color) => (
              <button
                key={color}
                onClick={() => handleValueChange(color)}
                className="w-8 h-8 rounded transition-all hover:scale-110"
                style={{ 
                  backgroundColor: color,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border-secondary)'
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* 透明度和模糊控制 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1" style={{color: 'var(--text-secondary)'}}>
            透明度: {Math.round(current.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={current.opacity}
            onChange={(e) => onChange({
              ...current,
              opacity: parseFloat(e.target.value),
            })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1" style={{color: 'var(--text-secondary)'}}>
            模糊度: {current.blur}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={current.blur}
            onChange={(e) => onChange({
              ...current,
              blur: parseInt(e.target.value),
            })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
