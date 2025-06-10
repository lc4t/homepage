'use client';

import React, { useState, useEffect } from 'react';
import { Item, ServiceItem, Config } from '@/types/config';
import { HealthChecker, ChecklistManager, getFaviconUrl } from '@/lib/config';
import { CheckSquare } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ItemCardProps {
  item: Item;
  onOpenChecklist?: (item: Item) => void;
  className?: string;
}

export function ItemCard({ item, onOpenChecklist, className = '' }: ItemCardProps) {
  const { theme } = useTheme(); // 获取当前主题
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
  const renderIcon = (item: Item, iconError: boolean, setIconError: (error: boolean) => void) => {
    // 如果有自定义图标且不是 URL，则显示为 emoji 或文本
    if (item.icon && !item.icon.startsWith('http') && !item.icon.startsWith('/')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
          {item.icon}
        </div>
      );
    }
    
    // 如果是网站或服务类型，尝试获取favicon
    if ((item.type === 'website' || item.type === 'service') && 'url' in item) {
      // 使用自定义图标或尝试获取favicon
      const iconUrl = item.icon || getFaviconUrl(item.url);
      
      if (!iconError) {
        return (
          <img 
            src={iconUrl}
            alt={item.title}
            className="w-8 h-8 rounded-lg object-cover"
            onError={() => setIconError(true)}
          />
        );
      }
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
  const cardBaseClass = "group relative backdrop-blur-[10px] rounded-xl transition-all duration-300 cursor-pointer";
  const cardClass = mounted ? `apple-card ${className}` : `${cardBaseClass} bg-white/10 border border-white/20 ${className}`;

  return (
    <div 
      className={cardClass}
      onClick={handleClick}
      data-theme={mounted ? theme : undefined}
    >
      <div className="p-6">
        {/* 图标和标题并排 */}
        <div className="flex items-center mb-3">
          <div className="mr-3">
            {renderIcon(item, iconError, setIconError)}
          </div>
          
          <h3 className="text-white font-medium text-sm flex-grow" style={{color: 'var(--text-primary)'}}>
            {item.title}
          </h3>
          
          <div className="ml-2">
            {getStatusIndicator()}
            {item.type === 'checklist' && (
              <CheckSquare className="w-4 h-4 text-white/60 mt-1" />
            )}
          </div>
        </div>

        {/* 描述 - 完整显示 */}
        <p className="text-xs mb-4 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
          {item.description}
        </p>

        {/* 底部信息 */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {/* 标签 - 完整显示所有标签 */}
          {item.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 text-xs rounded-md"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              {tag}
            </span>
          ))}
          
          {/* 进度信息 */}
          {getProgressInfo() && (
            <span 
              className="px-2 py-0.5 text-xs rounded-md ml-auto"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              {getProgressInfo()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ItemGridProps {
  items: Item[];
  onOpenChecklist?: (item: Item) => void;
  className?: string;
  config?: Config;
}

export function ItemGrid({ items, onOpenChecklist, className = '', config }: ItemGridProps) {
  // 根据项目类型进行分组
  const groupedByType = React.useMemo(() => {
    // 获取所有唯一的项目类型
    const types = Array.from(new Set(items.map(item => item.type)));
    
    // 为每种类型创建分组
    const groups: Record<string, {
      title: string;
      items: Item[];
      priority: number;
    }> = {};
    
    // 为每种类型设置标题、优先级和项目
    types.forEach(type => {
      // 默认值
      let title = 
        type === 'website' ? '网站' :
        type === 'service' ? '服务' :
        type === 'checklist' ? '清单' :
        type; // 如果是其他类型，直接使用类型名称
      
      let priority = 999; // 默认优先级最低
      
      // 如果配置文件中有定义，则使用配置文件中的值
      // 注意：typeGroups用于按类型分组，而groups用于按标签分组
      if (config?.layout.typeGroups && config.layout.typeGroups[type]) {
        title = config.layout.typeGroups[type].title || title;
        priority = config.layout.typeGroups[type].priority || priority;
      }
      
      groups[type] = {
        title,
        priority,
        items: items.filter(item => item.type === type)
      };
    });
    
    return groups;
  }, [items, config]);

  // 如果没有项目，显示空状态
  if (items.length === 0) {
    return (
      <div className="text-center text-white/60 py-12">
        <p className="text-lg mb-2">没有找到匹配的项目</p>
        <p className="text-sm">尝试调整搜索条件或检查配置文件</p>
      </div>
    );
  }

  // 按优先级排序类型
  const sortedTypes = Object.keys(groupedByType).sort((a, b) => 
    groupedByType[a].priority - groupedByType[b].priority
  );

  return (
    <div className="space-y-8">
      {/* 遍历所有类型分组（按优先级排序） */}
      {sortedTypes.map((type) => (
        <div key={type}>
          <h2 className="text-lg font-medium mb-4 px-2" style={{color: 'var(--text-primary)'}}>
            {groupedByType[type].title}
          </h2>
          <div className={`
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
            gap-4 ${className}
          `}>
            {groupedByType[type].items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onOpenChecklist={onOpenChecklist}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
