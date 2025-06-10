'use client';

import React from 'react';
import { X, ExternalLink, ClipboardCopy } from 'lucide-react';
import { SharedListItemConfig } from '@/types/config';
import { useTheme } from './ThemeProvider';

interface SharedListModalProps {
  item: SharedListItemConfig | null;
  onClose: () => void;
}

export function SharedListModal({ item, onClose }: SharedListModalProps) {
  const { theme } = useTheme();
  
  // 如果没有选中的列表，不显示
  if (!item) return null;

  // 复制所有链接到剪贴板
  const handleCopyAll = () => {
    if (!item) return;
    
    const links = item.items.map(listItem => `${listItem.text}: ${listItem.url}`).join('\n');
    navigator.clipboard.writeText(links)
      .then(() => {
        alert('所有链接已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  };

  // 复制单个链接到剪贴板
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        // 可以添加一些视觉反馈，比如短暂显示一个提示
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b" style={{borderColor: 'var(--border-secondary)'}}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
              {item.icon || '🔗'}
            </div>
            <h2 className="text-lg font-medium" style={{color: 'var(--text-primary)'}}>
              {item.title}
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10"
            style={{color: 'var(--text-secondary)'}}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 描述 */}
        <div className="p-4 border-b" style={{borderColor: 'var(--border-secondary)'}}>
          <p style={{color: 'var(--text-secondary)'}}>{item.description}</p>
        </div>
        
        {/* 链接列表 */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-3">
            {item.items.map((listItem) => (
              <li 
                key={listItem.id} 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 transition-colors"
                style={{backgroundColor: 'var(--bg-secondary)'}}
              >
                <a 
                  href={listItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow flex items-center gap-2"
                  style={{color: 'var(--text-primary)'}}
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{color: 'var(--text-tertiary)'}} />
                  <span>{listItem.text}</span>
                </a>
                
                <button
                  onClick={() => handleCopyLink(listItem.url)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10"
                  title="复制链接"
                  style={{color: 'var(--text-tertiary)'}}
                >
                  <ClipboardCopy className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 底部操作栏 */}
        <div className="p-4 border-t flex justify-between" style={{borderColor: 'var(--border-secondary)'}}>
          <div className="text-sm" style={{color: 'var(--text-secondary)'}}>
            共 {item.items.length} 个链接
          </div>
          
          <button
            onClick={handleCopyAll}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)'
            }}
          >
            复制全部链接
          </button>
        </div>
      </div>
    </div>
  );
} 