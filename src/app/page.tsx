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
        
        // 保持探针主机配置不变，让 HealthChecker 自己处理
        
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

    // 初始化健康检查系统
    const initHealthChecks = async () => {
      try {
        console.log("开始初始化健康检查系统...");
        
        // 使用 HealthChecker.initialize 方法初始化整个系统
        await HealthChecker.initialize(config);
        
        console.log("健康检查系统初始化完成");
        
      } catch (error) {
        console.error('健康检查初始化失败:', error);
      }
    };
    
    // 执行初始化
    initHealthChecks();
    
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
