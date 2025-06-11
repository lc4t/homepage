'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Item, Config } from '@/types/config';

interface SearchFilterProps {
  items: Item[];
  config?: Config;
  onFilter: (filteredItems: Item[]) => void;
  onSearchChange?: (query: string) => void;
  onTagsChange?: (tags: string[]) => void;
}

export function SearchFilter({ 
  items, 
  config,
  onFilter,
  onSearchChange,
  onTagsChange
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 提取所有标签并排序
  useEffect(() => {
    const tags = Array.from(new Set(items.flatMap(item => item.tags)));
    
    // 如果配置了pinnedTags，则按照pinnedTags的顺序排序
    if (config?.layout.pinnedTags && config.layout.pinnedTags.length > 0) {
      const pinnedTags = config.layout.pinnedTags;
      
      // 将标签分为置顶和非置顶两组
      const pinned = tags.filter(tag => pinnedTags.includes(tag))
        .sort((a, b) => {
          // 按照pinnedTags中的顺序排序
          return pinnedTags.indexOf(a) - pinnedTags.indexOf(b);
        });
      
      const others = tags.filter(tag => !pinnedTags.includes(tag)).sort();
      
      // 合并两组标签
      setAvailableTags([...pinned, ...others]);
    } else {
      // 没有配置pinnedTags，按字母顺序排序
      setAvailableTags(tags.sort());
    }
  }, [items, config]);

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
  }, [searchQuery, selectedTags, items, onFilter]);

  // 单独通知父组件搜索和标签变化
  useEffect(() => {
    if (onSearchChange) onSearchChange(searchQuery);
  }, [searchQuery, onSearchChange]);

  useEffect(() => {
    if (onTagsChange) onTagsChange(selectedTags);
  }, [selectedTags, onTagsChange]);

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

  return (
    <div className="apple-card p-6">
      {/* 搜索框 */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
            style={{color: 'var(--text-tertiary)'}} 
          />
          <input
            type="text"
            placeholder="搜索网站、服务或清单..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-primary)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          />
        </div>
        
        {/* 清除筛选按钮 */}
        {(searchQuery || selectedTags.length > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-all"
          >
            清除
          </button>
        )}
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 text-sm" style={{color: 'var(--text-secondary)'}}>
          <Filter className="w-4 h-4" />
          <span>标签:</span>
        </div>
        
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isPinned = config?.layout.pinnedTags?.includes(tag);
          const count = items.filter(item => item.tags.includes(tag)).length;
          
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: isSelected ? 'var(--border-primary)' : (isPinned ? 'var(--border-secondary)' : 'transparent')
              }}
            >
              {tag}
              <span className="ml-1 text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 筛选状态提示 */}
      {(searchQuery || selectedTags.length > 0) && (
        <div className="mt-3 text-sm" style={{color: 'var(--text-tertiary)'}}>
          {searchQuery && (
            <span>搜索: &quot;{searchQuery}&quot; </span>
          )}
          {selectedTags.length > 0 && (
            <span>标签: {selectedTags.join(', ')}</span>
          )}
        </div>
      )}

      {/* 移除了提示文字 */}
    </div>
  );
}
