import yaml from 'js-yaml';
import { Config, ServiceStatus, ChecklistState, Item, SharedListItemConfig, ChecklistItemConfig, SharedListItem, ChecklistItem, ServiceItem, ApplicationItem } from '@/types/config';

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
  healthCheck: {
    enabled: true,
    probe: {
      host: '127.0.0.1', // 默认使用本机作为探针
      interval: 300, // 5分钟检查一次
      timeout: 3 // 3秒超时
    }
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
      healthCheck: config.healthCheck ? {
        enabled: config.healthCheck.enabled !== undefined ? config.healthCheck.enabled : DEFAULT_CONFIG.healthCheck!.enabled,
        probe: config.healthCheck.probe ? {
          host: config.healthCheck.probe.host || DEFAULT_CONFIG.healthCheck!.probe!.host,
          interval: config.healthCheck.probe.interval || DEFAULT_CONFIG.healthCheck!.probe!.interval,
          timeout: config.healthCheck.probe.timeout || DEFAULT_CONFIG.healthCheck!.probe!.timeout
        } : DEFAULT_CONFIG.healthCheck!.probe
      } : DEFAULT_CONFIG.healthCheck,
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
  private static probeStatus: 'online' | 'offline' | 'unknown' = 'unknown';
  private static probeInterval: number | null = null;
  private static globalHealthCheckEnabled: boolean = true;
  private static statusListeners = new Map<string, Set<(status: ServiceStatus) => void>>();
  private static currentConfig: Config | null = null;
  
  static getStatus(itemId: string): ServiceStatus {
    return this.checks.get(itemId) || {
      id: itemId,
      status: 'unknown',
      lastChecked: new Date(),
    };
  }
  
  static getProbeStatus(): 'online' | 'offline' | 'unknown' {
    return this.probeStatus;
  }
  
  static isGlobalHealthCheckEnabled(): boolean {
    return this.globalHealthCheckEnabled;
  }
  
  // 订阅服务状态更新
  static subscribeToStatusUpdates(itemId: string, callback: (status: ServiceStatus) => void): void {
    console.log(`[订阅] 添加 ${itemId} 的状态监听器`);
    
    if (!this.statusListeners.has(itemId)) {
      this.statusListeners.set(itemId, new Set());
    }
    
    const listeners = this.statusListeners.get(itemId);
    listeners?.add(callback);
    
    console.log(`[订阅] ${itemId} 现在有 ${listeners?.size || 0} 个监听器`);
    
    // 如果已经有状态，立即通知
    const currentStatus = this.checks.get(itemId);
    if (currentStatus) {
      console.log(`[订阅] ${itemId} 已有状态，立即通知新监听器:`, currentStatus);
      try {
        callback(currentStatus);
      } catch (error) {
        console.error(`[订阅] 通知监听器出错:`, error);
      }
    }
  }
  
  // 取消订阅服务状态更新
  static unsubscribeFromStatusUpdates(itemId: string, callback: (status: ServiceStatus) => void): void {
    console.log(`[取消订阅] 移除 ${itemId} 的状态监听器`);
    
    const listeners = this.statusListeners.get(itemId);
    if (listeners) {
      const beforeSize = listeners.size;
      listeners.delete(callback);
      console.log(`[取消订阅] ${itemId} 监听器数量: ${beforeSize} -> ${listeners.size}`);
    }
  }
  
  // 通知状态更新
  private static notifyStatusUpdate(itemId: string, status: ServiceStatus): void {
    const listeners = this.statusListeners.get(itemId);
    console.log(`[通知] ${itemId} 状态更新:`, status, `监听器数量: ${listeners?.size || 0}`);
    
    // 无论是否有监听器，都保存状态
    this.checks.set(itemId, status);
    
    if (!listeners || listeners.size === 0) {
      console.log(`[通知] ${itemId} 没有监听器，状态已保存，将在组件挂载时自动获取状态`);
      return;
    }
    
    console.log(`[通知] ${itemId} 开始通知 ${listeners.size} 个监听器`);
    let notifiedCount = 0;
    
    listeners.forEach(callback => {
      try {
        callback(status);
        notifiedCount++;
      } catch (error) {
        console.error(`Error in status listener for ${itemId}:`, error);
      }
    });
    
    console.log(`[通知] ${itemId} 成功通知了 ${notifiedCount}/${listeners.size} 个监听器`);
  }
  
  // 设置初始checking状态
  static setInitialCheckingStatus(itemId: string): void {
    // 如果探针不可达，直接跳过
    if (this.probeStatus === 'offline') {
      console.log(`[${itemId}] 探针不可达，不设置初始checking状态`);
      return;
    }
    
    console.log(`[${itemId}] 设置初始checking状态`);
    
    // 查找服务配置，确保服务存在
    const serviceConfig = this.findServiceConfig(itemId);
    if (!serviceConfig) {
      console.error(`[${itemId}] 设置初始checking状态失败: 找不到服务配置`);
      return;
    }
    
    // 创建checking状态
    const checkingStatus: ServiceStatus = {
      id: itemId,
      status: 'checking',
      lastChecked: new Date(),
    };
    
    // 保存状态并通知所有监听器
    this.checks.set(itemId, checkingStatus);
    
    // 打印当前所有监听器
    const listeners = this.statusListeners.get(itemId);
    console.log(`[${itemId}] 当前监听器数量: ${listeners?.size || 0}`);
    
    // 强制通知状态更新，即使没有监听器
    this.notifyStatusUpdate(itemId, checkingStatus);
    console.log(`[${itemId}] 已通知状态更新为checking`);
  }
  
  // 执行一次服务检查
  static async checkServiceOnce(itemId: string): Promise<void> {
    // 如果探针不可达，直接跳过
    if (this.probeStatus === 'offline') {
      console.log(`[${itemId}] 探针不可达，不执行服务检查`);
      return;
    }
    
    // 查找对应的服务项配置
    const serviceConfig = this.findServiceConfig(itemId);
    if (!serviceConfig) {
      console.error(`无法找到服务配置: ${itemId}`);
      return;
    }
    
    console.log(`[检查] 开始检查服务 ${itemId}`);
    
    // 设置状态为checking
    const checkingStatus: ServiceStatus = {
      id: itemId,
      status: 'checking',
      lastChecked: new Date(),
    };
    this.checks.set(itemId, checkingStatus);
    this.notifyStatusUpdate(itemId, checkingStatus);
    
    // 获取服务配置
    const url = serviceConfig.healthCheck?.url || serviceConfig.url;
    const type = serviceConfig.healthCheck?.type || 'http';
    const host = serviceConfig.healthCheck?.host;
    const port = serviceConfig.healthCheck?.port;
    
    console.log(`[检查] ${itemId} 配置:`, { url, type, host, port });
    
    if (!url && !(type === 'tcp' && host && port)) {
      console.error(`服务配置不完整: ${itemId}`);
      return;
    }
    
    // 执行检查
    console.log(`[检查] 执行 ${itemId} 的检查`);
    await this.performCheck(itemId, url, type, host, port);
    console.log(`[检查] ${itemId} 检查完成`);
  }
  
  // 查找服务配置
  private static findServiceConfig(itemId: string): ServiceItem | ApplicationItem | null {
    // 从当前配置中查找服务项
    if (!this.currentConfig || !this.currentConfig.items) {
      console.error(`查找服务配置失败: 当前配置为空或没有items数组`);
      return null;
    }
    
    // 查找匹配的服务或应用项
    console.log(`[查找] 查找服务配置: ${itemId}, 当前配置中有 ${this.currentConfig.items.length} 个项目`);
    
    // 调试：打印所有服务和应用项的ID
    const serviceIds = this.currentConfig.items
      .filter(item => item.type === 'service' || item.type === 'application')
      .map(item => item.id);
    console.log(`[查找] 所有服务和应用项ID: ${serviceIds.join(', ')}`);
    
    const serviceItem = this.currentConfig.items.find(item => 
      item.id === itemId && (item.type === 'service' || item.type === 'application')
    ) as ServiceItem | ApplicationItem | undefined;
    
    if (!serviceItem) {
      console.error(`[查找] 未找到服务配置: ${itemId}`);
    } else {
      console.log(`[查找] 找到服务配置: ${itemId}, 类型: ${serviceItem.type}`);
    }
    
    return serviceItem || null;
  }
  
  // 初始化探针检测
  static async initProbe(config: Config): Promise<boolean> {
    // 保存当前配置以供后续使用
    this.currentConfig = config;
    console.log("[配置] 保存配置到HealthChecker:", config.items.length, "个项目");
    // 清除现有探针检测
    if (this.probeInterval) {
      clearInterval(this.probeInterval);
      this.probeInterval = null;
    }
    
    // 设置全局健康检查状态
    this.globalHealthCheckEnabled = config.healthCheck?.enabled ?? true;
    
    // 如果未启用全局健康检查或未配置探针，则直接返回
    if (!config.healthCheck?.enabled || !config.healthCheck.probe) {
      this.probeStatus = 'offline'; // 设置为离线状态，这样不会启动健康检查
      console.log("[探针] 全局健康检查未启用或未配置探针");
      // 清除所有服务状态
      this.checks.clear();
      return false;
    }
    
    const { host, timeout = 3 } = config.healthCheck.probe;
    
    console.log("[探针] 开始初始化探针检测:", host);
    
    // 立即执行一次探针检测并等待结果
    await this.checkProbe(host, timeout);
    
    // 如果探针不可达，清除所有服务状态
    if (this.probeStatus !== 'online') {
      console.log("[探针] 探针不可达，清除所有服务状态");
      this.checks.clear();
    }
    
    // 不再设置定期探针检测，只在页面加载时检测一次
    console.log("[探针] 探针状态:", this.probeStatus);
    
    // 返回探针状态
    return this.probeStatus === 'online';
  }
  
  // 检查探针状态
  private static async checkProbe(host: string, timeout: number = 3): Promise<'online' | 'offline' | 'unknown'> {
    // 只在浏览器环境下运行
    if (typeof window === 'undefined') {
      this.probeStatus = 'unknown';
      return 'unknown';
    }
    
    console.log(`[探针] 开始检测探针: ${host}`);
    
    // 特殊处理本地主机或localhost
    if (host === '127.0.0.1' || host === 'localhost' || host === window.location.hostname) {
      this.probeStatus = 'online';
      console.log(`[探针] 探针是本地主机 (${host})，自动视为可达`);
      return 'online';
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
      
      try {
        // 尝试连接探针主机
        console.log(`[探针] 正在检测探针: http://${host}`);
        await fetch(`http://${host}`, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        
        // 如果没有抛出异常，说明探针可达
        clearTimeout(timeoutId);
        this.probeStatus = 'online';
        console.log(`[探针] 探针检测成功: ${host} 可达`);
        return 'online';
      } catch (error) {
        clearTimeout(timeoutId);
        
        // 如果是CORS错误，也认为探针可达
        if (error instanceof TypeError && error.message.includes('CORS')) {
          this.probeStatus = 'online';
          console.log(`[探针] 探针检测成功: ${host} 可达 (CORS)`);
          return 'online';
        } else {
          this.probeStatus = 'offline';
          console.log(`[探针] 探针检测失败: ${host} 不可达`, error);
          return 'offline';
        }
      }
    } catch (error) {
      this.probeStatus = 'offline';
      console.log(`[探针] 探针检测出错: ${host}`, error);
      return 'offline';
    }
  }
  
  static async checkService(url: string, type: 'http' | 'tcp' = 'http', host?: string, port?: number): Promise<{ status: 'online' | 'offline', statusCode?: number, errorMessage?: string }> {
    // 只在浏览器环境下运行
    if (typeof window === 'undefined') {
      return { status: 'offline', errorMessage: 'Server-side' };
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
          return { status: 'online', statusCode: 200 };
        } catch (error) {
          // 如果是 CORS 错误，说明端口可能是开放的
          if (error instanceof TypeError && error.message.includes('CORS')) {
            clearTimeout(timeoutId);
            return { status: 'online', statusCode: 0, errorMessage: 'CORS' };
          }
          // 其他错误（如连接被拒绝）说明端口未开放
          clearTimeout(timeoutId);
          return { 
            status: 'offline', 
            errorMessage: error instanceof Error ? error.message : 'Connection failed'
          };
        }
      } else {
        // HTTP 检查
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // 记录是否需要调试日志
        const DEBUG = true;
        
        try {
          // 先尝试普通模式的 HEAD 请求，这样可以获取真实状态码
          try {
            if (DEBUG) console.log(`尝试普通模式 HEAD 请求: ${url}`);
            const response = await fetch(url, {
              method: 'HEAD',
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            if (DEBUG) console.log(`请求成功，状态码: ${response.status}`);
            
            // 获取真实状态码
            return { 
              status: response.ok ? 'online' : 'offline', 
              statusCode: response.status
            };
          } catch (corsError) {
            if (DEBUG) console.log(`普通模式请求失败，尝试 no-cors 模式: ${url}`, corsError);
            
            // 如果普通模式失败，尝试 no-cors 模式
            await fetch(url, {
              method: 'HEAD',
              mode: 'no-cors',
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            // 由于使用了no-cors模式，我们无法获取真实的状态码
            // 但请求成功表示服务在线
            if (DEBUG) console.log(`no-cors 模式请求成功，无法获取状态码`);
            return { 
              status: 'online', 
              statusCode: 0,  // 使用0表示未知状态码
              errorMessage: 'CORS限制，无法获取状态码'
            };
          }
        } catch (error) {
          if (DEBUG) console.log(`HEAD 请求失败，尝试 GET 请求: ${url}, 错误:`, error);
          
          // 检查是否是超时错误
          if (error instanceof DOMException && error.name === 'AbortError') {
            return { 
              status: 'offline', 
              errorMessage: 'Timeout'
            };
          }
          
          // 如果是 CORS 错误，我们认为服务可能在线
          if (error instanceof TypeError && error.message.includes('CORS')) {
            return { 
              status: 'online', 
              statusCode: 0, // 使用0表示未知状态码
              errorMessage: 'CORS'
            };
          }
          
          // HEAD 请求失败，尝试 GET 请求
          try {
            const getController = new AbortController();
            const getTimeoutId = setTimeout(() => getController.abort(), 5000);
            
            // 先尝试普通模式的 GET 请求
            try {
              if (DEBUG) console.log(`尝试普通模式 GET 请求: ${url}`);
              const response = await fetch(url, {
                method: 'GET',
                signal: getController.signal,
              });
              
              clearTimeout(getTimeoutId);
              if (DEBUG) console.log(`GET 请求成功，状态码: ${response.status}`);
              
              // 获取真实状态码
              return { 
                status: response.ok ? 'online' : 'offline', 
                statusCode: response.status
              };
            } catch (corsError) {
              if (DEBUG) console.log(`普通模式 GET 请求失败，尝试 no-cors 模式: ${url}`, corsError);
              
              // 如果普通模式失败，尝试 no-cors 模式
              await fetch(url, {
                method: 'GET',
                mode: 'no-cors',
                signal: getController.signal,
              });
              
              clearTimeout(getTimeoutId);
              if (DEBUG) console.log(`no-cors 模式 GET 请求成功，无法获取状态码`);
              
              return { 
                status: 'online', 
                statusCode: 0,  // 使用0表示未知状态码
                errorMessage: 'CORS限制，无法获取状态码'
              };
            }
          } catch (getError) {
            if (DEBUG) console.log(`GET 请求也失败: ${url}, 错误:`, getError);
            
            // 检查是否是超时错误
            if (getError instanceof DOMException && getError.name === 'AbortError') {
              return { 
                status: 'offline', 
                errorMessage: 'Timeout'
              };
            }
            
            // 如果是 CORS 错误，说明服务可能在线但有跨域限制
            if (getError instanceof TypeError && getError.message.includes('CORS')) {
              return { 
                status: 'online', 
                statusCode: 0, // 使用0表示未知状态码
                errorMessage: 'CORS'
              };
            }
            
            return { 
              status: 'offline', 
              errorMessage: getError instanceof Error ? getError.message : 'Request failed'
            };
          }
        }
      }
    } catch (error) {
      return { 
        status: 'offline', 
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
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
      // 检查探针状态，如果探针不可达，则设置服务状态为未知
      if (this.probeStatus === 'offline') {
        this.checks.set(itemId, {
          id: itemId,
          status: 'unknown',
          lastChecked: new Date(),
          errorMessage: '探针不可达，健康检查已暂停'
        });
        return;
      }
      
      // 探针可达，正常执行检查
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
    // 检查探针状态，如果探针不可达，则直接返回，不做任何操作
    if (this.probeStatus === 'offline') {
      console.log(`[${itemId}] 探针不可达，跳过服务检查`);
      return;
    }
    
    const checkingStatus: ServiceStatus = {
      id: itemId,
      status: 'checking',
      lastChecked: new Date(),
    };
    this.checks.set(itemId, checkingStatus);
    this.notifyStatusUpdate(itemId, checkingStatus);
    
    const startTime = Date.now();
    const result = await this.checkService(url, type, host, port);
    const responseTime = Date.now() - startTime;
    
    const newStatus: ServiceStatus = {
      id: itemId,
      status: result.status,
      lastChecked: new Date(),
      responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage
    };
    this.checks.set(itemId, newStatus);
    this.notifyStatusUpdate(itemId, newStatus);
  }
}
