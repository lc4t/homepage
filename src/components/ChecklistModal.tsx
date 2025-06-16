'use client';

import React, { useState, useEffect } from 'react';
import { ChecklistItemConfig } from '@/types/config';
import { ChecklistManager } from '@/lib/config';
import { X, Download, Check } from 'lucide-react';

interface ChecklistModalProps {
  item: ChecklistItemConfig | null;
  onClose: () => void;
}

export function ChecklistModal({ item, onClose }: ChecklistModalProps) {
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // 加载清单状态
  useEffect(() => {
    if (item) {
      const state = ChecklistManager.getState();
      setChecklistState(state[item.id] || {});
    }
  }, [item]);

  // 关闭弹窗
  const handleClose = () => {
    onClose();
  };

  // 切换清单项状态
  const toggleItem = (checklistItemId: string) => {
    if (!item) return;
    
    // 找到对应的项目
    const checklistItem = item.items.find(i => i.id === checklistItemId);
    
    // 如果是小标题，不切换状态
    if (checklistItem?.isHeader) return;
    
    ChecklistManager.toggleItem(item.id, checklistItemId);
    const newState = ChecklistManager.getState();
    setChecklistState(newState[item.id] || {});
  };

  // 导出为Markdown
  const exportMarkdown = async () => {
    if (!item) return;

    // 过滤掉小标题项，只计算实际待办事项
    const todoItems = item.items.filter(subItem => !subItem.isHeader);
    
    const completedItems = item.items.filter(subItem => 
      checklistState[subItem.id]
    );
    const pendingItems = item.items.filter(subItem => 
      !subItem.isHeader && !checklistState[subItem.id]
    );

    // 创建包含小标题的完整项目列表
    const allItems = [...item.items];
    
    // 将项目分为已完成和未完成两组，但保留小标题
    const completedGroup = [];
    const pendingGroup = [];
    
    for (const subItem of allItems) {
      if (subItem.isHeader) {
        // 小标题添加到两个组
        completedGroup.push(subItem);
        pendingGroup.push(subItem);
      } else if (checklistState[subItem.id]) {
        // 已完成的任务
        completedGroup.push(subItem);
      } else {
        // 未完成的任务
        pendingGroup.push(subItem);
      }
    }

    const markdown = `# ${item.title}

${item.description}

## 已完成 (${completedItems.length}/${todoItems.length})

${completedGroup.map(subItem => {
  const indent = subItem.indent || 0;
  const spaces = '  '.repeat(indent);
  // 如果是小标题，使用 Markdown 的三级标题格式
  if (subItem.isHeader) {
    return `${spaces}### ${subItem.text}`;
  }
  return `${spaces}- [x] ${subItem.text}`;
}).join('\n')}

## 待完成 (${pendingItems.length}/${todoItems.length})

${pendingGroup.map(subItem => {
  const indent = subItem.indent || 0;
  const spaces = '  '.repeat(indent);
  // 如果是小标题，使用 Markdown 的三级标题格式
  if (subItem.isHeader) {
    return `${spaces}### ${subItem.text}`;
  }
  return `${spaces}- [ ] ${subItem.text}`;
}).join('\n')}

---
导出时间: ${new Date().toLocaleString()}，点此查看原文：https://homepage.sakanano.moe/
`;

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(markdown);
      
      // 显示成功提示
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = '已复制到剪贴板';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('opacity-0');
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => document.body.removeChild(toast), 500);
      }, 2000);
    } catch (err) {
      console.error('复制到剪贴板失败:', err);
      
      // 显示错误提示
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = '复制失败，请手动复制';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('opacity-0');
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => document.body.removeChild(toast), 500);
      }, 2000);
    }
  };

  // 计算完成进度
  const getProgress = () => {
    if (!item) return { completed: 0, total: 0, percentage: 0 };
    
    // 过滤掉小标题项
    const todoItems = item.items.filter(subItem => !subItem.isHeader);
    const completed = todoItems.filter(subItem => 
      checklistState[subItem.id]
    ).length;
    const total = todoItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  if (!item) return null;

  const progress = getProgress();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0" 
        onClick={handleClose}
      />
      
      <div className="relative bg-white/10 dark:bg-white/5 backdrop-blur-[20px] border border-white/20 dark:border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                {item.title}
              </h2>
              <p className="text-white/70 text-sm mb-3">
                {item.description}
              </p>
              
              {/* 进度条 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-white/80 text-sm font-medium min-w-fit">
                  {progress.completed}/{progress.total}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={exportMarkdown}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-all"
                title="导出 Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 清单内容 */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-2">
            {item.items.map((checklistItem) => {
              const isCompleted = checklistState[checklistItem.id] || false;
              const indentLevel = checklistItem.indent || 0;
              const isHeader = checklistItem.isHeader || false;
              
              // 如果是小标题，使用不同的样式
              if (isHeader) {
                return (
                  <div 
                    key={checklistItem.id}
                    className={`
                      mt-4 mb-2 ${indentLevel > 0 ? 'ml-4' : ''}
                    `}
                  >
                    <h3 className="text-white font-semibold text-md border-b border-white/20 pb-1">
                      {checklistItem.text}
                    </h3>
                  </div>
                );
              }
              
              // 普通清单项
              return (
                <div 
                  key={checklistItem.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer
                    hover:bg-white/5 dark:hover:bg-white/10 ${isCompleted ? 'opacity-75' : ''}
                  `}
                  onClick={() => toggleItem(checklistItem.id)}
                  style={{ paddingLeft: `${(indentLevel * 1.5) + 0.75}rem` }}
                >
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-white/30 hover:border-white/50'
                    }
                  `}>
                    {isCompleted && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  <span className={`
                    text-white transition-all flex-1
                    ${isCompleted ? 'line-through opacity-60' : ''}
                    ${indentLevel > 0 ? 'text-sm' : ''}
                  `}>
                    {checklistItem.text}
                  </span>
                </div>
              );
            })}
          </div>

          {item.items.length === 0 && (
            <div className="text-center text-white/50 py-8">
              暂无清单项目
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
