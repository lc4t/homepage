'use client';

import React, { useState, useEffect } from 'react';
import { Item, Config, ChecklistItemConfig, SharedListItemConfig, ServiceItem, ApplicationItem, ServiceStatus } from '@/types/config';
import { HealthChecker, ChecklistManager } from '@/lib/config';
import { useTheme } from './ThemeProvider';
import { IconComponent } from './IconComponent';
import { ListChecks, Share2 } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onOpenChecklist?: (item: Item) => void;
  onOpenSharedList?: (item: Item) => void;
  className?: string;
}

export function ItemCard({ item, onOpenChecklist, onOpenSharedList, className = '' }: ItemCardProps) {
  console.log(`[${item.id}] ItemCard 渲染开始`);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [checklistProgress, setChecklistProgress] = React.useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  // 添加状态来存储服务状态，而不是每次重新获取
  const [serviceStatus, setServiceStatus] = React.useState<ServiceStatus | null>(null);
  // 添加状态来跟踪是否应该显示健康状态
  // 默认值根据全局健康检查状态和项目类型设置
  const shouldShowHealth = 
    (item.type === 'service' || item.type === 'application') && 
    !!(item as ServiceItem | ApplicationItem).healthCheck?.enabled && 
    HealthChecker.isGlobalHealthCheckEnabled() && 
    HealthChecker.getProbeStatus() === 'online';
  
  console.log(`[${item.id}] 初始化 shouldShowHealth=${shouldShowHealth}, 
    type=${item.type}, 
    healthCheckEnabled=${(item.type === 'service' || item.type === 'application') ? !!(item as ServiceItem | ApplicationItem).healthCheck?.enabled : false}, 
    globalEnabled=${HealthChecker.isGlobalHealthCheckEnabled()}, 
    probeStatus=${HealthChecker.getProbeStatus()}`);
  
  const [showHealthStatus, setShowHealthStatus] = React.useState<boolean>(shouldShowHealth);
  
  // 健康状态更新处理函数 - 使用useCallback确保引用稳定
  const handleStatusUpdate = React.useCallback((status: ServiceStatus) => {
    if (item.type === 'service' || item.type === 'application') {
      const serviceItem = item as ServiceItem | ApplicationItem;
      console.log(`[${serviceItem.id}] 收到状态更新:`, status);
      if (status.id === serviceItem.id) {
        setServiceStatus(status);
      }
    }
  }, [item]);
  
  // 客户端挂载检测
  useEffect(() => {
    setMounted(true);
    
    // 在组件挂载时，如果是服务或应用类型，立即注册监听器
    if ((item.type === 'service' || item.type === 'application')) {
      const serviceItem = item as ServiceItem | ApplicationItem;
      if (serviceItem.healthCheck?.enabled && HealthChecker.getProbeStatus() === 'online') {
        console.log(`[${serviceItem.id}] 组件挂载时注册监听器`);
        HealthChecker.subscribeToStatusUpdates(serviceItem.id, handleStatusUpdate);
        
        // 获取初始状态
        const initialStatus = HealthChecker.getStatus(serviceItem.id);
        console.log(`[${serviceItem.id}] 初始状态:`, initialStatus);
        
        // 设置初始状态
        setServiceStatus(initialStatus);
        
        // 强制设置显示健康状态为true
        if (HealthChecker.isGlobalHealthCheckEnabled()) {
          console.log(`[${serviceItem.id}] 强制设置显示健康状态为true`);
          setShowHealthStatus(true);
        }
      }
    }
    
    // 清理函数
    return () => {
      if (item.type === 'service' || item.type === 'application') {
        const serviceItem = item as ServiceItem | ApplicationItem;
        console.log(`[${serviceItem.id}] 组件卸载时取消监听器`);
        HealthChecker.unsubscribeFromStatusUpdates(serviceItem.id, handleStatusUpdate);
      }
    };
  }, [item, handleStatusUpdate]);
  
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

  // 检查是否应该显示健康状态以及获取服务状态
  useEffect(() => {
    // 只对服务和应用类型项目处理
    if (item.type !== 'service' && item.type !== 'application') {
      console.log(`[${item.id}] 不是服务或应用类型，不显示健康状态`);
      setShowHealthStatus(false);
      return;
    }
    
    const serviceItem = item as ServiceItem | ApplicationItem;
    
    // 检查是否配置了健康检查
    if (!serviceItem.healthCheck?.enabled) {
      console.log(`[${serviceItem.id}] 未启用健康检查，不显示健康状态`);
      setShowHealthStatus(false);
      return;
    }
    
    // 检查全局健康检查状态和探针状态
    const globalHealthCheckEnabled = HealthChecker.isGlobalHealthCheckEnabled();
    const probeStatus = HealthChecker.getProbeStatus();
    
    console.log(`[${serviceItem.id}] 健康检查状态:`, { 
      globalHealthCheckEnabled, 
      probeStatus, 
      healthCheckEnabled: serviceItem.healthCheck?.enabled 
    });
    
    // 显示条件：全局健康检查启用 且 探针可达 且 服务配置了健康检查
    const shouldShow = globalHealthCheckEnabled && 
      probeStatus === 'online' && 
      serviceItem.healthCheck?.enabled;
    
    console.log(`[${serviceItem.id}] 是否显示健康状态:`, shouldShow, '当前探针状态:', probeStatus);
    console.log(`[${serviceItem.id}] 详细状态: globalHealthCheckEnabled=${globalHealthCheckEnabled}, probeStatus=${probeStatus}, healthCheckEnabled=${serviceItem.healthCheck?.enabled}`);
    
    // 设置是否显示健康状态
    setShowHealthStatus(shouldShow);
    console.log(`[${serviceItem.id}] 设置showHealthStatus=${shouldShow}`);
    
    if (shouldShow) {
      // 注册状态更新回调
      console.log(`[${serviceItem.id}] 注册状态更新回调`);
      HealthChecker.subscribeToStatusUpdates(serviceItem.id, handleStatusUpdate);
      
      // 获取初始状态
      const initialStatus = HealthChecker.getStatus(serviceItem.id);
      console.log(`[${serviceItem.id}] 初始状态:`, initialStatus);
      
      // 设置初始状态 - 无论是什么状态，先显示Testing徽章
      setServiceStatus({
        ...initialStatus,
        status: initialStatus.status === 'unknown' ? 'checking' : initialStatus.status
      });
      
      // 清理函数：取消订阅
      return () => {
        console.log(`[${serviceItem.id}] 取消状态更新订阅`);
        HealthChecker.unsubscribeFromStatusUpdates(serviceItem.id, handleStatusUpdate);
      };
    }
  }, [item, handleStatusUpdate]);  // 移除mounted作为依赖，避免在客户端挂载后重新执行

  const handleClick = () => {
    if (item.type === 'checklist' && onOpenChecklist) {
      onOpenChecklist(item);
    } else if (item.type === 'sharedlist' && onOpenSharedList) {
      onOpenSharedList(item);
    } else if (item.type === 'website' || item.type === 'service' || item.type === 'application') {
      const url = 'url' in item ? (item as { url: string }).url : undefined;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  const getStatusIndicator = () => {
    // 添加详细调试日志
    console.log(`[${item.id}] 获取状态指示器:`, { 
      showHealthStatus, 
      serviceStatus,
      probeStatus: HealthChecker.getProbeStatus(),
      globalHealthCheckEnabled: HealthChecker.isGlobalHealthCheckEnabled()
    });
    
    // 如果不应该显示健康状态，不显示任何徽章
    if (!showHealthStatus) {
      console.log(`[${item.id}] 不显示健康状态 (showHealthStatus=${showHealthStatus})`);
      return null;
    }
    
    // 如果探针不可达，不显示徽章
    if (HealthChecker.getProbeStatus() !== 'online') {
      console.log(`[${item.id}] 探针不可达，不显示徽章 (probeStatus=${HealthChecker.getProbeStatus()})`);
      return null;
    }
    
    // 如果没有服务状态，显示Testing徽章
    if (!serviceStatus) {
      console.log(`[${item.id}] 没有服务状态，显示Testing徽章`);
      return (
        <span 
          className="text-xs font-medium px-1.5 py-0.5 rounded-md text-white bg-yellow-500"
          style={{ fontSize: '0.65rem', lineHeight: '1rem' }}
        >
          Testing
        </span>
      );
    }
    
    // 如果状态是checking或unknown，显示Testing徽章
    if (serviceStatus.status === 'checking' || serviceStatus.status === 'unknown') {
      console.log(`[${item.id}] 状态为${serviceStatus.status}，显示Testing徽章`);
      return (
        <span 
          className="text-xs font-medium px-1.5 py-0.5 rounded-md text-white bg-yellow-500"
          style={{ fontSize: '0.65rem', lineHeight: '1rem' }}
        >
          Testing
        </span>
      );
    }
    
    // 根据状态生成不同颜色和文本的badge
    let badgeText = '';
    let badgeColor = '';
    
    // 特殊处理CORS错误 - 显示为Running而不是CORS
    if (serviceStatus.status === 'online' && (serviceStatus.errorMessage === 'CORS' || serviceStatus.errorMessage === 'CORS限制，无法获取状态码' || serviceStatus.statusCode === 0)) {
      badgeText = 'Running';
      badgeColor = 'bg-blue-500'; // 使用蓝色表示服务运行中但无法获取状态码
    } else {
      switch (serviceStatus.status) {
        case 'online':
          badgeText = serviceStatus.statusCode && serviceStatus.statusCode > 0 ? `${serviceStatus.statusCode}` : 'OK';
          badgeColor = 'bg-green-500';
          break;
        case 'offline':
          badgeText = serviceStatus.errorMessage === 'Timeout' ? 'Timeout' : 'Error';
          badgeColor = 'bg-red-500';
          break;
        default:
          console.log(`[${item.id}] 未知状态:`, serviceStatus.status);
          return null;
      }
    }
    
    console.log(`[${item.id}] 显示徽章:`, { badgeText, badgeColor });
    
    return (
      <span 
        className={`text-xs font-medium px-1.5 py-0.5 rounded-md text-white ${badgeColor}`}
        style={{ fontSize: '0.65rem', lineHeight: '1rem' }}
      >
        {badgeText}
      </span>
    );
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

  // 在渲染前再次检查状态
  console.log(`[${item.id}] 渲染前状态检查: showHealthStatus=${showHealthStatus}, serviceStatus=${JSON.stringify(serviceStatus)}, probeStatus=${HealthChecker.getProbeStatus()}, globalEnabled=${HealthChecker.isGlobalHealthCheckEnabled()}`);

  // 根据探针状态更新showHealthStatus
  React.useEffect(() => {
    if ((item.type === 'service' || item.type === 'application')) {
      const serviceItem = item as ServiceItem | ApplicationItem;
      const probeStatus = HealthChecker.getProbeStatus();
      
      // 只有在探针可达且其他条件满足时才设置为true
      if (serviceItem.healthCheck?.enabled && 
          HealthChecker.isGlobalHealthCheckEnabled() && 
          probeStatus === 'online' && 
          !showHealthStatus) {
        console.log(`[${item.id}] 探针可达，设置showHealthStatus=true`);
        setShowHealthStatus(true);
      } 
      // 如果探针不可达，确保设置为false
      else if (probeStatus !== 'online' && showHealthStatus) {
        console.log(`[${item.id}] 探针不可达，设置showHealthStatus=false`);
        setShowHealthStatus(false);
      }
    }
  }, [item.id, item.type, showHealthStatus]);

  return (
    <div 
      className={cardClass}
      onClick={handleClick}
      data-theme={mounted ? theme : undefined}
      style={{ position: 'relative' }} // 确保有相对定位
    >
      <div className="p-6 h-full flex flex-col">
        {/* 健康状态徽章 - 绝对定位在右上角 */}
        {/* 调试日志 */}
        {(() => { 
          console.log(`[${item.id}] 渲染徽章: showHealthStatus=${showHealthStatus}, type=${item.type}, healthCheckEnabled=${(item.type === 'service' || item.type === 'application') ? !!(item as ServiceItem | ApplicationItem).healthCheck?.enabled : false}`); 
          return null; 
        })()}
        {/* 只有在全局探针可达时才显示徽章 */}
        {(item.type === 'service' || item.type === 'application') && 
         (item as ServiceItem | ApplicationItem).healthCheck?.enabled && 
         HealthChecker.isGlobalHealthCheckEnabled() && 
         HealthChecker.getProbeStatus() === 'online' && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
            {getStatusIndicator()}
          </div>
        )}
        
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
          
          <div className="flex flex-col flex-grow">
            <h3 className="text-white font-medium text-sm" style={{color: 'var(--text-primary)'}}>
              {item.title}
            </h3>
          </div>
          
          <div className="ml-2">
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
