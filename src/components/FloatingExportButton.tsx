'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Item } from '@/types/config';
import { exportToMarkdown } from '@/lib/config';

interface FloatingExportButtonProps {
  items: Item[];
  selectedTags: string[];
  searchQuery: string;
  exportTemplate?: string;
  exportItemFormat?: string;
}

export function FloatingExportButton({
  items,
  selectedTags,
  searchQuery,
  exportTemplate,
  exportItemFormat
}: FloatingExportButtonProps) {
  const exportCurrentFilter = async () => {
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

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(content);
      showToast('已复制到剪贴板');
    } catch (err) {
      console.error('复制到剪贴板失败:', err);
      showToast('复制失败，请手动复制', 'error');
    }
  };

  // 简单的提示框实现
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0');
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 hidden md:block z-30">
      <button
        onClick={exportCurrentFilter}
        className="p-4 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white shadow-lg transition-all hover:scale-105"
        title="导出当前筛选结果到剪贴板"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
} 