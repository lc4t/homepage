'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Item } from '@/types/config';
import { exportToMarkdown } from '@/lib/config';

interface SearchFilterProps {
  items: Item[];
  onFilter: (filteredItems: Item[]) => void;
  exportTemplate?: string;
  exportItemFormat?: string;
}

export function SearchFilter({ 
  items, 
  onFilter, 
  exportTemplate, 
  exportItemFormat 
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 提取所有标签
  useEffect(() => {
    const tags = Array.from(new Set(items.flatMap(item => item.tags)));
    setAllTags(tags.sort());
  }, [items]);

  // 过滤项目
  useEffect(() => {
    let filtered = items;

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 按标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    onFilter(filtered);
  }, [searchQuery, selectedTags, items]); // 移除 onFilter 从依赖数组

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const exportCurrentFilter = () => {
    const filteredItems = items.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => item.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    const tagName = selectedTags.length === 1 ? selectedTags[0] : '筛选结果';
    const markdown = exportToMarkdown(
      filteredItems,
      undefined,
      exportTemplate,
      exportItemFormat
    );

    const content = selectedTags.length === 1 && exportTemplate
      ? exportTemplate.replace('{tag}', tagName).replace('{items}', markdown)
      : `# ${tagName}\n\n${markdown}`;

    // 下载文件
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tagName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-[10px] border border-white/20 dark:border-white/10 rounded-2xl p-6">
      {/* 搜索框 */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="搜索网站、服务或清单..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          {/* 导出按钮 */}
          <button
            onClick={exportCurrentFilter}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-xl transition-all flex items-center gap-2"
            title="导出当前筛选结果"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
          
          {/* 清除筛选 */}
          {(searchQuery || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-all"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 text-white/70 dark:text-white/80 text-sm">
          <Filter className="w-4 h-4" />
          <span>标签:</span>
        </div>
        
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const count = items.filter(item => item.tags.includes(tag)).length;
          
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                px-3 py-1.5 rounded-lg text-sm transition-all
                ${isSelected
                  ? 'bg-white/20 dark:bg-white/30 text-white border border-white/30 dark:border-white/40'
                  : 'bg-white/10 dark:bg-white/20 text-white/80 dark:text-white/90 hover:bg-white/15 dark:hover:bg-white/25 border border-transparent'
                }
              `}
            >
              {tag}
              <span className="ml-1 text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 筛选状态提示 */}
      {(searchQuery || selectedTags.length > 0) && (
        <div className="mt-3 text-white/60 dark:text-white/70 text-sm">
          {searchQuery && (
            <span>搜索: "{searchQuery}" </span>
          )}
          {selectedTags.length > 0 && (
            <span>标签: {selectedTags.join(', ')}</span>
          )}
        </div>
      )}
    </div>
  );
}
