'use client';

import React, { useState, useEffect } from 'react';
import { Item, ServiceItem } from '@/types/config';
import { HealthChecker, ChecklistManager } from '@/lib/config';
import { ExternalLink, Clock, CheckSquare } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ItemCardProps {
  item: Item;
  onOpenChecklist?: (item: Item) => void;
  className?: string;
}

export function ItemCard({ item, onOpenChecklist, className = '' }: ItemCardProps) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState<{completed: number; total: number} | null>(null);
  const [iconError, setIconError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 客户端挂载检测
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 获取清单进度
  useEffect(() => {
    if (item.type === 'checklist') {
      const progressData = ChecklistManager.getProgress(item.id, item.items.length);
      setProgress(progressData);
    }
  }, [item]);

  const handleClick = () => {
    if (item.type === 'checklist') {
      onOpenChecklist?.(item);
    } else if ('url' in item) {
      window.open(item.url, '_blank');
    }
  };

  const getStatusIndicator = () => {
    if (item.type === 'service') {
      const serviceItem = item as ServiceItem;
      if (serviceItem.healthCheck?.enabled) {
        const status = HealthChecker.getStatus(item.id);
        return (
          <div 
            className={`w-2 h-2 rounded-full ${
              status.status === 'online' ? 'bg-green-400' :
              status.status === 'offline' ? 'bg-red-400' :
              status.status === 'checking' ? 'bg-yellow-400 animate-pulse' :
              'bg-gray-400'
            }`}
            title={`状态: ${status.status}`}
          />
        );
      }
    }
    return null;
  };

  const getProgressInfo = () => {
    if (item.type === 'checklist' && progress) {
      return `${progress.completed}/${progress.total}`;
    }
    return null;
  };

  // 渲染图标的函数
  const renderIcon = () => {
    // 如果有自定义图标且不是 URL，则显示为 emoji 或文本
    if (item.icon && !item.icon.startsWith('http') && !item.icon.startsWith('/')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
          {item.icon}
        </div>
      );
    }
    
    // 如果有自定义图标且是 URL且没有加载错误
    if (item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) && !iconError) {
      return (
        <img 
          src={item.icon}
          alt={item.title}
          className="w-8 h-8 rounded-lg object-cover"
          onError={() => setIconError(true)}
        />
      );
    }
    
    // 否则显示默认图标（首字母）
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
        {item.title.charAt(0).toUpperCase()}
      </div>
    );
  };

  // 在服务器端或客户端首次渲染时使用基本样式
  const cardStyle = mounted 
    ? `
        group relative 
        ${theme === 'dark' 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-white/10 border-white/20 hover:bg-white/15'
        }
        backdrop-blur-[10px] border rounded-xl p-4
        hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10
        transition-all duration-300 cursor-pointer
        ${className}
      `
    : `
        group relative 
        bg-white/10 border-white/20
        backdrop-blur-[10px] border rounded-xl p-4
        transition-all duration-300 cursor-pointer
        ${className}
      `;

  const tagStyle = (index: number) => {
    if (!mounted) return "px-2 py-0.5 bg-white/10 text-white/80 text-xs rounded-md";
    
    return `
      px-2 py-0.5 text-xs rounded-md
      ${theme === 'dark' 
        ? 'bg-white/20 text-white/90' 
        : 'bg-white/10 text-white/80'
      }
    `;
  };

  const extraTagsStyle = mounted && theme === 'dark' 
    ? 'text-xs text-white/60' 
    : 'text-xs text-white/50';

  const progressStyle = mounted && theme === 'dark' 
    ? 'text-xs text-white/70' 
    : 'text-xs text-white/60';

  return (
    <div 
      className={cardStyle}
      onClick={handleClick}
      data-theme={mounted ? theme : undefined}
    >
      {/* 图标和状态 */}
      <div className="flex items-start justify-between mb-3">
        <div className="relative">
          {renderIcon()}
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          {item.type === 'checklist' ? (
            <CheckSquare className="w-4 h-4 text-white/60" />
          ) : (
            <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white/60 transition-colors" />
          )}
        </div>
      </div>

      {/* 标题 */}
      <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
        {item.title}
      </h3>

      {/* 描述 */}
      <p className="text-white/70 text-xs mb-3 line-clamp-2 leading-relaxed">
        {item.description}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-between">
        {/* 标签 */}
        <div className="flex gap-1 flex-wrap">
          {item.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className={tagStyle(index)}
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className={extraTagsStyle}>
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        {/* 进度或其他信息 */}
        <div className={progressStyle}>
          {getProgressInfo()}
        </div>
      </div>
    </div>
  );
}

interface ItemGridProps {
  items: Item[];
  onOpenChecklist?: (item: Item) => void;
  className?: string;
}

export function ItemGrid({ items, onOpenChecklist, className = '' }: ItemGridProps) {
  return (
    <div className={`
      grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 
      gap-4 ${className}
    `}>
      {items.map((item) => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onOpenChecklist={onOpenChecklist}
        />
      ))}
    </div>
  );
}
