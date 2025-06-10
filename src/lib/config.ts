import yaml from 'js-yaml';
import { Config, ServiceStatus, ChecklistState } from '@/types/config';

// 默认配置
const DEFAULT_CONFIG: Partial<Config> = {
  site: {
    title: '个人导航站',
    description: 'Personal Navigation Hub',
    author: 'User',
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
      site: { ...DEFAULT_CONFIG.site, ...config.site },
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

// 获取favicon URL
export function getFaviconUrl(url: string, fallback?: string): string {
  if (fallback && (fallback.startsWith('http') || fallback.startsWith('/'))) {
    return fallback;
  }
  
  try {
    const domain = new URL(url).hostname;
    // 使用多个favicon服务作为备选
    return `https://icon.horse/icon/${domain}`;
  } catch {
    return fallback || '/favicon.ico';
  }
}

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
  
  static getProgress(itemId: string, totalItems: number): { completed: number; total: number } {
    const state = this.getState();
    const itemState = state[itemId] || {};
    const completed = Object.values(itemState).filter(Boolean).length;
    return { completed, total: totalItems };
  }
}

// 导出为Markdown
export function exportToMarkdown(
  items: any[], 
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
      if (item.type === 'sharedlist' && item.items && item.items.length > 0) {
        // 分享列表类型，导出所有链接
        const listHeader = format
          .replace('{title}', item.title)
          .replace('{url}', '#')
          .replace('{description}', item.description);
        
        const links = item.items.map((link: any) => 
          `  - [${link.text}](${link.url})`
        ).join('\n');
        
        return `${listHeader}\n${links}`;
      } else if (item.type === 'checklist' && item.items && item.items.length > 0) {
        // 清单类型，导出所有项目
        const listHeader = format
          .replace('{title}', item.title)
          .replace('{url}', '#')
          .replace('{description}', item.description);
        
        const tasks = item.items.map((task: any) => 
          `  - [${task.completed ? 'x' : ' '}] ${task.text}`
        ).join('\n');
        
        return `${listHeader}\n${tasks}`;
      } else {
        // 普通项目
        return format
          .replace('{title}', item.title)
          .replace('{url}', item.url || '#')
          .replace('{description}', item.description);
      }
    })
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
  
  static async checkService(url: string): Promise<'online' | 'offline'> {
    // 只在浏览器环境下运行
    if (typeof window === 'undefined') {
      return 'unknown' as any;
    }
    
    try {
      // 使用fetch检查服务（受CORS限制）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return 'online';
    } catch {
      return 'offline';
    }
  }
  
  static startChecking(itemId: string, url: string, interval: number = 60): void {
    // 只在浏览器环境下运行
    if (typeof window === 'undefined') {
      return;
    }
    
    // 清除现有检查
    this.stopChecking(itemId);
    
    // 立即执行一次检查
    this.performCheck(itemId, url);
    
    // 设置定期检查
    const intervalId = window.setInterval(() => {
      this.performCheck(itemId, url);
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
  
  private static async performCheck(itemId: string, url: string): Promise<void> {
    this.checks.set(itemId, {
      id: itemId,
      status: 'checking',
      lastChecked: new Date(),
    });
    
    const startTime = Date.now();
    const status = await this.checkService(url);
    const responseTime = Date.now() - startTime;
    
    this.checks.set(itemId, {
      id: itemId,
      status,
      lastChecked: new Date(),
      responseTime,
    });
  }
}
