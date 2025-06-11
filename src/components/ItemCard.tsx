'use client';

import React, { useState, useEffect } from 'react';
import { Item, Config, ChecklistItemConfig, SharedListItemConfig, ServiceItem } from '@/types/config';
import { HealthChecker, ChecklistManager } from '@/lib/config';
import { useTheme } from './ThemeProvider';
import { IconComponent } from './IconComponent';
import { CheckCircle2, XCircle, Clock, ListChecks, Share2 } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onOpenChecklist?: (item: Item) => void;
  onOpenSharedList?: (item: Item) => void;
  className?: string;
}

export function ItemCard({ item, onOpenChecklist, onOpenSharedList, className = '' }: ItemCardProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = React.useState<'online' | 'offline' | 'checking' | 'unknown'>('unknown');
  const [checklistProgress, setChecklistProgress] = React.useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  
  // 客户端挂载检测
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 获取清单进度
  useEffect(() => {
    if (item.type === 'checklist') {
      const checklistItem = item as ChecklistItemConfig;
      if (checklistItem.items) {
        // 传递完整的items数组，以便排除小标题项
        const progressData = ChecklistManager.getProgress(
          checklistItem.id, 
          checklistItem.items.length, 
          checklistItem.items
        );
        setChecklistProgress(progressData);
      }
    }
  }, [item]);

  // 获取服务状态
  useEffect(() => {
    if (item.type === 'service') {
      const serviceItem = item as ServiceItem;
      const checkStatus = () => {
        const status = HealthChecker.getStatus(serviceItem.id);
        setStatus(status.status);
      };
      checkStatus();
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [item]);

  const handleClick = () => {
    if (item.type === 'checklist' && onOpenChecklist) {
      onOpenChecklist(item);
    } else if (item.type === 'sharedlist' && onOpenSharedList) {
      onOpenSharedList(item);
    } else if (item.type === 'website' || item.type === 'service') {
      const url = 'url' in item ? (item as { url: string }).url : undefined;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  const getStatusIndicator = () => {
    if (item.type !== 'service') return null;

    switch (status) {
      case 'online':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getProgressInfo = () => {
    if (item.type === 'checklist') {
      const checklistItem = item as ChecklistItemConfig;
      if (checklistItem.items) {
        return `${checklistProgress.completed}/${checklistProgress.total}`;
      }
    } else if (item.type === 'sharedlist') {
      const sharedListItem = item as SharedListItemConfig;
      if (sharedListItem.items) {
        return `${sharedListItem.items.length} 个链接`;
      }
    }
    return null;
  };

  // 获取项目URL（如果存在）
  const getItemUrl = (item: Item): string | undefined => {
    if ('url' in item) {
      const urlItem = item as { url: string };
      return urlItem.url;
    }
    return undefined;
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
      <div className="p-6 h-full flex flex-col">
        {/* 图标和标题并排 */}
        <div className="flex items-center mb-3">
          <div className="mr-3">
            <IconComponent
              icon={item.icon}
              title={item.title}
              url={getItemUrl(item)}
              itemType={item.type}
              size={32}
            />
          </div>
          
          <h3 className="text-white font-medium text-sm flex-grow" style={{color: 'var(--text-primary)'}}>
            {item.title}
          </h3>
          
          <div className="ml-2">
            {getStatusIndicator()}
            {item.type === 'checklist' && (
              <ListChecks className="w-4 h-4 text-white/60 mt-1" style={{color: 'var(--text-tertiary)'}} />
            )}
            {item.type === 'sharedlist' && (
              <Share2 className="w-4 h-4 text-white/60 mt-1" style={{color: 'var(--text-tertiary)'}} />
            )}
          </div>
        </div>

        {/* 描述 - 自动填充剩余空间 */}
        <p className="text-xs leading-relaxed flex-1 mb-4" style={{color: 'var(--text-secondary)'}}>
          {item.description}
        </p>

        {/* 底部信息 - 始终在底部对齐 */}
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
  onOpenSharedList?: (item: Item) => void;
  className?: string;
  config?: Config;
}

export function ItemGrid({ items, onOpenChecklist, onOpenSharedList, className = '', config }: ItemGridProps) {
  // 添加调试日志
  React.useEffect(() => {
    if (config?.layout.typeGroups) {
      console.log("ItemGrid接收到的typeGroups配置:", config.layout.typeGroups);
    }
  }, [config]);
  
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
      // 默认值 - 如果没有配置，则使用类型名称本身作为默认值
      let title = type;
      let priority = 999; // 默认优先级最低
      
      // 如果配置文件中有定义，则使用配置文件中的值
      // 注意：typeGroups用于按类型分组，而groups用于按标签分组
      if (config?.layout.typeGroups && type in config.layout.typeGroups) {
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
      {sortedTypes.map((type) => {
        console.log(`渲染类型 ${type}, 标题: ${groupedByType[type].title}`);
        return (
          <div key={type}>
            <h2 className="text-lg font-medium mb-4 px-2" style={{color: 'var(--text-primary)'}}>
              {groupedByType[type].title}
            </h2>
            <div className={`
              grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
              gap-4 auto-rows-fr ${className}
            `}>
              {groupedByType[type].items.map((item) => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onOpenChecklist={onOpenChecklist}
                  onOpenSharedList={onOpenSharedList}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
