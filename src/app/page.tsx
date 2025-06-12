'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Config, Item, ChecklistItemConfig, SharedListItemConfig, ServiceItem, ApplicationItem } from '@/types/config';
import { loadConfig, HealthChecker } from '@/lib/config';
import { Background } from '@/components/Background';
import { Header } from '@/components/Header';
import { SearchFilter } from '@/components/SearchFilter';
import { ItemGrid } from '@/components/ItemCard';
import { ChecklistModal } from '@/components/ChecklistModal';
import { SharedListModal } from '@/components/SharedListModal';
import { FloatingExportButton } from '@/components/FloatingExportButton';
import { FaviconHandler } from '@/components/FaviconHandler';

export default function HomePage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistItemConfig | null>(null);
  const [selectedSharedList, setSelectedSharedList] = useState<SharedListItemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // 加载配置 - 只在组件挂载时执行
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const loadedConfig = await loadConfig();
        console.log("加载的配置:", loadedConfig);
        console.log("类型分组配置:", loadedConfig.layout.typeGroups);
        
        // 如果没有明确设置探针主机，则使用当前主机名
        if (loadedConfig.healthCheck?.probe && 
            (!loadedConfig.healthCheck.probe.host || loadedConfig.healthCheck.probe.host === '127.0.0.1')) {
          loadedConfig.healthCheck.probe.host = window.location.hostname;
          console.log(`自动设置探针主机为当前主机: ${loadedConfig.healthCheck.probe.host}`);
        }
        
        setConfig(loadedConfig);
        setFilteredItems(loadedConfig.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '配置加载失败');
        console.error('配置加载错误:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 启动健康检查 - 当配置加载后且背景图片加载完成后执行
  useEffect(() => {
    if (!config || !backgroundLoaded) return;
    
    console.log("背景图片已加载，开始执行健康检查...");

    // 初始化探针检测，然后根据探针状态决定是否启动服务健康检查
    const initHealthChecks = async () => {
      console.log("开始初始化健康检查...");
      
      // 初始化探针并等待结果
      const probeOnline = await HealthChecker.initProbe(config);
      
      // 如果探针不可达，则不启动服务健康检查
      if (!probeOnline) {
        console.log("探针不可达，不执行健康检查");
        return;
      }
      
      console.log("探针可达，启动服务健康检查");
      
      // 延迟一点时间，确保组件已经挂载并注册了监听器
      setTimeout(() => {
        // 再次检查探针状态，确保在执行检查前探针仍然可达
        if (HealthChecker.getProbeStatus() !== 'online') {
          console.log("预处理前探针已不可达，取消服务检查");
          return;
        }
        
        // 只有探针可达时，才对每个服务项执行检查
        console.log("开始处理服务项...");
        let serviceCount = 0;
        
        // 先预处理所有服务项，设置为checking状态
        config.items.forEach(item => {
          if (item.type === 'service' || item.type === 'application') {
            // 检查是否有健康检查配置
            const serviceItem = item as ServiceItem | ApplicationItem;
            if (serviceItem.healthCheck?.enabled) {
              serviceCount++;
              console.log(`预处理服务项 ${serviceCount}: ${serviceItem.id}`);
              
              // 先设置为checking状态，以便显示Testing徽章
              console.log(`设置 ${serviceItem.id} 为checking状态`);
              HealthChecker.setInitialCheckingStatus(serviceItem.id);
            }
          }
        });
        
        console.log(`共预处理了 ${serviceCount} 个服务项`);
        
        // 再延迟一点时间，确保组件已经注册了监听器
        setTimeout(() => {
          // 再次检查探针状态，确保在执行检查前探针仍然可达
          if (HealthChecker.getProbeStatus() !== 'online') {
            console.log("执行检查前探针已不可达，取消服务检查");
            return;
          }
          
          console.log("开始执行服务检查...");
          let checkCount = 0;
          
          // 然后执行检查
          config.items.forEach(item => {
            if (item.type === 'service' || item.type === 'application') {
              // 检查是否有健康检查配置
              const serviceItem = item as ServiceItem | ApplicationItem;
              if (serviceItem.healthCheck?.enabled) {
                checkCount++;
                // 执行一次性检查
                console.log(`执行服务检查 ${checkCount}: ${serviceItem.id}`);
                HealthChecker.checkServiceOnce(serviceItem.id);
              }
            }
          });
          
          console.log(`共执行了 ${checkCount} 个服务检查`);
        }, 2000); // 延迟2000ms执行检查，给组件更多时间注册监听器
      }, 1000); // 延迟1000ms执行，确保组件已经挂载
    };
    
    // 执行初始化
    initHealthChecks();
    
    // 不需要清理函数，因为我们不再使用定时器
  }, [config, backgroundLoaded]);

  const handleOpenChecklist = (item: Item) => {
    if (item.type === 'checklist') {
      setSelectedChecklist(item as ChecklistItemConfig);
    }
  };

  const handleCloseChecklist = () => {
    setSelectedChecklist(null);
  };

  const handleOpenSharedList = (item: Item) => {
    if (item.type === 'sharedlist') {
      setSelectedSharedList(item as SharedListItemConfig);
    }
  };

  const handleCloseSharedList = () => {
    setSelectedSharedList(null);
  };

  // 处理背景加载完成的回调
  const handleBackgroundLoaded = () => {
    console.log("背景图片加载完成");
    setBackgroundLoaded(true);
  };

  const handleFilter = useCallback((items: Item[]) => {
    // 按配置排序项目
    if (!config) {
      setFilteredItems(items);
      return;
    }

    const { pinned, groups } = config.layout;
    const sortedItems: Item[] = [];
    const remaining = [...items];

    // 添加置顶项目
    pinned.forEach(id => {
      const index = remaining.findIndex(item => item.id === id);
      if (index !== -1) {
        sortedItems.push(remaining.splice(index, 1)[0]);
      }
    });

    // 按分组排序
    groups
      .sort((a, b) => a.priority - b.priority)
      .forEach(group => {
        const groupItems = remaining.filter(item =>
          group.tags.some(tag => item.tags.includes(tag))
        );
        groupItems.forEach(item => {
          const index = remaining.indexOf(item);
          if (index !== -1) {
            sortedItems.push(remaining.splice(index, 1)[0]);
          }
        });
      });

    // 添加其余项目
    sortedItems.push(...remaining);

    setFilteredItems(sortedItems);
  }, [config]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 fixed inset-0" />
        <div className="relative z-10 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500 fixed inset-0" />
        <div className="relative z-10 text-white text-center">
          <h1 className="text-2xl font-bold mb-4">配置加载失败</h1>
          <p className="text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* 动态设置favicon */}
      <FaviconHandler siteConfig={config.site} />
      
      {/* 背景 */}
      <Background config={config.appearance.background} onLoaded={handleBackgroundLoaded} />
      
      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 头部 */}
        <Header 
          siteConfig={config.site}
        />

        {/* 搜索和筛选 */}
        <div className="px-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <SearchFilter
              items={config.items}
              config={config}
              onFilter={handleFilter}
              onSearchChange={handleSearchChange}
              onTagsChange={handleTagsChange}
            />
          </div>
        </div>

        {/* 项目网格 */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {filteredItems.length > 0 ? (
              <ItemGrid 
                items={filteredItems}
                onOpenChecklist={handleOpenChecklist}
                onOpenSharedList={handleOpenSharedList}
                config={config}
              />
            ) : (
              <div className="text-center text-white/60 dark:text-white/70 py-12">
                <p className="text-lg mb-4">没有找到匹配的项目</p>
                <p className="text-sm">尝试调整搜索条件或检查配置文件</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 浮动导出按钮 */}
      <FloatingExportButton 
        items={config.items}
        selectedTags={selectedTags}
        searchQuery={searchQuery}
        exportTemplate={config.export.markdown.template}
        exportItemFormat={config.export.markdown.item_format}
      />

      {/* 清单弹窗 */}
      <ChecklistModal 
        item={selectedChecklist}
        onClose={handleCloseChecklist}
      />

      {/* 分享列表弹窗 */}
      <SharedListModal 
        item={selectedSharedList}
        onClose={handleCloseSharedList}
      />

      {/* Google Analytics */}
      {config.site.analytics && (
        <>
          <script 
            async 
            src={`https://www.googletagmanager.com/gtag/js?id=${config.site.analytics}`}
          />
          <script 
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.site.analytics}');
              `
            }}
          />
        </>
      )}
    </main>
  );
}
