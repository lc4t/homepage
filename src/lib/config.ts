import yaml from 'js-yaml';
import { Config, ServiceStatus, ChecklistState, Item, SharedListItemConfig, ChecklistItemConfig, SharedListItem, ChecklistItem } from '@/types/config';

// 默认配置
const DEFAULT_CONFIG: Partial<Config> = {
  site: {
    favicon: '/favicon.ico',
    analytics: '',
    metadata: {
      title: '个人导航站',
      description: 'Personal Navigation Hub',
      author: 'User',
      language: 'zh-CN',
      keywords: '导航, 个人, 服务, 管理',
    },
  },
  appearance: {
    theme: {
      auto: true,
      default: 'light',
    },
    background: {
      type: 'bing',
      value: 'today',
      blur: 0,
      opacity: 0.8,
    },
    card: {
      blur: 10,
      opacity: 0.1,
    },
  },
  layout: {
    pinned: [],
    groups: [],
  },
  export: {
    markdown: {
      template: '## {tag}\n\n{items}',
      item_format: '- [{title}]({url}) - {description}',
    },
  },
  items: [],
};

// 加载配置文件
export async function loadConfig(): Promise<Config> {
  try {
    const response = await fetch('/config/site.yaml');
    if (!response.ok) {
      throw new Error(`配置文件加载失败: ${response.status}`);
    }
    
    const yamlText = await response.text();
    const config = yaml.load(yamlText) as Config;
    
    if (!config || typeof config !== 'object') {
      throw new Error('配置文件格式错误');
    }
    
    // 深度合并配置
    const mergedConfig: Config = {
      site: { 
        ...DEFAULT_CONFIG.site, 
        ...config.site,
        // 确保元数据被正确合并
        metadata: {
          ...DEFAULT_CONFIG.site?.metadata,
          ...config.site?.metadata
        }
      },
      appearance: {
        theme: { ...DEFAULT_CONFIG.appearance!.theme, ...config.appearance?.theme },
        background: { ...DEFAULT_CONFIG.appearance!.background, ...config.appearance?.background },
        card: { ...DEFAULT_CONFIG.appearance!.card, ...config.appearance?.card },
      },
      layout: { 
        pinned: config.layout?.pinned || DEFAULT_CONFIG.layout!.pinned,
        groups: config.layout?.groups || DEFAULT_CONFIG.layout!.groups,
        pinnedTags: config.layout?.pinnedTags || [],
        typeGroups: config.layout?.typeGroups || {},
      },
      export: { ...DEFAULT_CONFIG.export, ...config.export },
      items: config.items || [],
    };
    
    return mergedConfig;
  } catch (error) {
    console.error('配置加载失败，使用默认配置:', error);
    // 返回一个基本的可用配置
    return {
      ...DEFAULT_CONFIG,
      items: [],
    } as Config;
  }
}

// 验证YAML配置文件
export function validateYamlConfig(yamlText: string): { valid: boolean; error?: string } {
  try {
    const config = yaml.load(yamlText);
    
    // 基本验证
    if (!config || typeof config !== 'object') {
      return { valid: false, error: '配置格式错误' };
    }
    
    // 可以添加更多具体的验证逻辑
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

// getFaviconUrl函数已移至IconComponent中

// 根据时间判断是否应该使用深色主题
export function shouldUseDarkTheme(): boolean {
  const hour = new Date().getHours();
  // 日出6点，日落18点
  return hour < 6 || hour >= 18;
}

// 清单状态管理
export class ChecklistManager {
  private static STORAGE_KEY = 'homepage-checklist-state';
  
  static getState(): ChecklistState {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  
  static setState(state: ChecklistState): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('保存清单状态失败:', error);
    }
  }
  
  static toggleItem(itemId: string, checklistItemId: string): void {
    const state = this.getState();
    if (!state[itemId]) {
      state[itemId] = {};
    }
    state[itemId][checklistItemId] = !state[itemId][checklistItemId];
    this.setState(state);
  }
  
  static isCompleted(itemId: string, checklistItemId: string): boolean {
    const state = this.getState();
    return state[itemId]?.[checklistItemId] || false;
  }
  
  static getProgress(itemId: string, totalItems: number, items?: ChecklistItem[]): { completed: number; total: number } {
    const state = this.getState();
    const itemState = state[itemId] || {};
    const completed = Object.values(itemState).filter(Boolean).length;
    
    // 如果提供了items参数，则排除小标题项
    if (items) {
      const todoItems = items.filter(item => !item.isHeader);
      return { completed, total: todoItems.length };
    }
    
    return { completed, total: totalItems };
  }
}

// 导出为Markdown
export function exportToMarkdown(
  items: Item[], 
  tag?: string, 
  template?: string,
  itemFormat?: string
): string {
  const filteredItems = tag 
    ? items.filter(item => item.tags.includes(tag))
    : items;
  
  const defaultItemFormat = '- [{title}]({url}) - {description}';
  const format = itemFormat || defaultItemFormat;
  
  const itemsText = filteredItems
    .map(item => {
      // 处理不同类型的项目
      if (item.type === 'sharedlist') {
        const sharedListItem = item as SharedListItemConfig;
        if (sharedListItem.items && sharedListItem.items.length > 0) {
          // 分享列表类型，导出所有链接
          const listHeader = format
            .replace('{title}', sharedListItem.title)
            .replace('{url}', '#')
            .replace('{description}', sharedListItem.description);
          
          const links = sharedListItem.items.map((link: SharedListItem) => 
            `  - [${link.text}](${link.url})`
          ).join('\n');
          
          return `${listHeader}\n${links}`;
        }
      } else if (item.type === 'checklist') {
        const checklistItem = item as ChecklistItemConfig;
        if (checklistItem.items && checklistItem.items.length > 0) {
          // 清单类型，导出所有项目
          const listHeader = format
            .replace('{title}', checklistItem.title)
            .replace('{url}', '#')
            .replace('{description}', checklistItem.description);
          
          // 处理清单项，支持小标题
          const tasks = checklistItem.items.map((task: ChecklistItem) => {
            // 如果是小标题，使用 Markdown 的三级标题格式
            if (task.isHeader) {
              // 支持缩进
              const indent = task.indent ? '  '.repeat(task.indent) : '';
              return `${indent}### ${task.text}`;
            }
            
            // 普通任务项，支持缩进
            const indent = task.indent ? '  '.repeat(task.indent) : '';
            return `${indent}- [${task.completed ? 'x' : ' '}] ${task.text}`;
          }).join('\n');
          
          return `${listHeader}\n${tasks}`;
        }
      } else {
        // 普通项目
        return format
          .replace('{title}', item.title)
          .replace('{url}', 'url' in item ? (item as { url: string }).url : '#')
          .replace('{description}', item.description);
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
  
  if (tag && template) {
    return template
      .replace('{tag}', tag)
      .replace('{items}', itemsText);
  }
  
  return itemsText;
}

// 服务健康检查
export class HealthChecker {
  private static checks = new Map<string, ServiceStatus>();
  private static intervals = new Map<string, number>();
  
  static getStatus(itemId: string): ServiceStatus {
    return this.checks.get(itemId) || {
      id: itemId,
      status: 'unknown',
      lastChecked: new Date(),
    };
  }
  
  static async checkService(url: string, type: 'http' | 'tcp' = 'http', host?: string, port?: number): Promise<'online' | 'offline'> {
    // 只在浏览器环境下运行
    if (typeof window === 'undefined') {
      return 'offline';
    }
    
    try {
      if (type === 'tcp' && host && port) {
        // TCP 检查 - 使用 fetch 尝试连接端口
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          // 尝试连接端口
          await fetch(`http://${host}:${port}`, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
          });
          
          // 只要能连接就认为端口是开放的
          clearTimeout(timeoutId);
          return 'online';
        } catch (error) {
          // 如果是 CORS 错误，说明端口是开放的
          if (error instanceof TypeError && error.message.includes('CORS')) {
            clearTimeout(timeoutId);
            return 'online';
          }
          // 其他错误（如连接被拒绝）说明端口未开放
          clearTimeout(timeoutId);
          return 'offline';
        }
      } else {
        // HTTP 检查
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return 'online';
      }
    } catch {
      return 'offline';
    }
  }
  
  static startChecking(itemId: string, url: string, type: 'http' | 'tcp' = 'http', host?: string, port?: number, interval: number = 60): void {
    // 只在浏览器环境下运行
    if (typeof window === 'undefined') {
      return;
    }
    
    // 清除现有检查
    this.stopChecking(itemId);
    
    // 立即执行一次检查
    this.performCheck(itemId, url, type, host, port);
    
    // 设置定期检查
    const intervalId = window.setInterval(() => {
      this.performCheck(itemId, url, type, host, port);
    }, interval * 1000);
    
    this.intervals.set(itemId, intervalId);
  }
  
  static stopChecking(itemId: string): void {
    const intervalId = this.intervals.get(itemId);
    if (intervalId) {
      window.clearInterval(intervalId);
      this.intervals.delete(itemId);
    }
  }
  
  private static async performCheck(itemId: string, url: string, type: 'http' | 'tcp' = 'http', host?: string, port?: number): Promise<void> {
    this.checks.set(itemId, {
      id: itemId,
      status: 'checking',
      lastChecked: new Date(),
    });
    
    const startTime = Date.now();
    const status = await this.checkService(url, type, host, port);
    const responseTime = Date.now() - startTime;
    
    this.checks.set(itemId, {
      id: itemId,
      status,
      lastChecked: new Date(),
      responseTime,
    });
  }
}
