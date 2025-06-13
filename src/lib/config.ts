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
      if (item.type === 'sharedlist') {
        const sharedListItem = item as SharedListItemConfig;
        if (sharedListItem.items && sharedListItem.items.length > 0) {
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
          const listHeader = format
            .replace('{title}', checklistItem.title)
            .replace('{url}', '#')
            .replace('{description}', checklistItem.description);
          
          const tasks = checklistItem.items.map((task: ChecklistItem) => {
            if (task.isHeader) {
              const indent = task.indent ? '  '.repeat(task.indent) : '';
              return `${indent}### ${task.text}`;
            }
            
            const indent = task.indent ? '  '.repeat(task.indent) : '';
            return `${indent}- [${task.completed ? 'x' : ' '}] ${task.text}`;
          }).join('\n');
          
          return `${listHeader}\n${tasks}`;
        }
      } else {
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

// 全新的健康检查系统
export class HealthChecker {
  private static checks = new Map<string, ServiceStatus>();
  private static probeStatus: 'online' | 'offline' | 'unknown' = 'unknown';
  private static globalHealthCheckEnabled: boolean = true;
  private static currentConfig: Config | null = null;
  
  // 全局状态变更监听器
  private static globalStateListeners = new Set<() => void>();
  private static serviceStatusListeners = new Map<string, Set<(status: ServiceStatus) => void>>();
  
  // 初始化标志
  private static initialized = false;
  
  // 添加主页面需要的方法
  
  // 初始化探针（主页面调用）
  static async initProbe(config: Config): Promise<boolean> {
    console.log('[初始化探针] 开始');
    
    this.currentConfig = config;
    this.globalHealthCheckEnabled = config.healthCheck?.enabled ?? true;
    
    if (!this.globalHealthCheckEnabled) {
      console.log('[初始化探针] 全局健康检查未启用');
      this.probeStatus = 'offline';
      this.initialized = true;
      this.notifyGlobalStateChange();
      return false;
    }
    
    if (!config.healthCheck?.probe?.host) {
      console.log('[初始化探针] 未配置探针主机');
      this.probeStatus = 'online'; // 如果没有配置探针，默认为在线
      this.initialized = true;
      this.notifyGlobalStateChange();
      return true;
    }
    
    // 检查探针
    await this.checkProbe(config.healthCheck.probe.host, config.healthCheck.probe.timeout || 3);
    this.initialized = true;
    this.notifyGlobalStateChange();
    
    const isOnline = this.probeStatus === 'online';
    console.log(`[初始化探针] 完成，状态: ${this.probeStatus}`);
    return isOnline;
  }
  
  // 设置服务初始checking状态（主页面调用）
  static setInitialCheckingStatus(itemId: string): void {
    console.log(`[${itemId}] 设置初始checking状态`);
    
    const checkingStatus: ServiceStatus = {
      id: itemId,
      status: 'checking',
      lastChecked: new Date(),
    };
    
    this.notifyServiceStatusChange(itemId, checkingStatus);
  }
  
  // 订阅全局状态变更（探针状态或全局配置变更）
  static subscribeToGlobalStateChange(callback: () => void): void {
    console.log('[全局状态] 添加全局状态监听器');
    this.globalStateListeners.add(callback);
  }
  
  // 取消订阅全局状态变更
  static unsubscribeFromGlobalStateChange(callback: () => void): void {
    console.log('[全局状态] 移除全局状态监听器');
    this.globalStateListeners.delete(callback);
  }
  
  // 通知全局状态变更
  private static notifyGlobalStateChange(): void {
    console.log(`[全局状态] 通知 ${this.globalStateListeners.size} 个监听器全局状态变更`);
    this.globalStateListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[全局状态] 通知监听器出错:', error);
      }
    });
  }
  
  // 订阅服务状态变更
  static subscribeToServiceStatus(itemId: string, callback: (status: ServiceStatus) => void): void {
    console.log(`[服务状态] 添加 ${itemId} 的状态监听器`);
    
    if (!this.serviceStatusListeners.has(itemId)) {
      this.serviceStatusListeners.set(itemId, new Set());
    }
    
    const listeners = this.serviceStatusListeners.get(itemId);
    listeners?.add(callback);
    
    // 如果已经有状态，立即通知
    const currentStatus = this.checks.get(itemId);
    if (currentStatus) {
      console.log(`[服务状态] ${itemId} 已有状态，立即通知:`, currentStatus);
      try {
        callback(currentStatus);
      } catch (error) {
        console.error(`[服务状态] 通知监听器出错:`, error);
      }
    }
  }
  
  // 取消订阅服务状态变更
  static unsubscribeFromServiceStatus(itemId: string, callback: (status: ServiceStatus) => void): void {
    console.log(`[服务状态] 移除 ${itemId} 的状态监听器`);
    
    const listeners = this.serviceStatusListeners.get(itemId);
    if (listeners) {
      listeners.delete(callback);
    }
  }
  
  // 通知服务状态变更
  private static notifyServiceStatusChange(itemId: string, status: ServiceStatus): void {
    // 保存状态
    this.checks.set(itemId, status);
    
    // 通知监听器
    const listeners = this.serviceStatusListeners.get(itemId);
    console.log(`[服务状态] ${itemId} 状态更新:`, status, `监听器数量: ${listeners?.size || 0}`);
    
    if (listeners && listeners.size > 0) {
      listeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error(`[服务状态] 通知监听器出错:`, error);
        }
      });
    }
  }
  
  // 获取当前状态
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
  
  static isInitialized(): boolean {
    return this.initialized;
  }
  
  // 判断是否应该显示健康状态
  static shouldShowHealthStatus(item: ServiceItem | ApplicationItem): boolean {
    return this.globalHealthCheckEnabled && 
           this.probeStatus === 'online' && 
           !!item.healthCheck?.enabled;
  }
  
  // 初始化健康检查系统
  static async initialize(config: Config): Promise<void> {
    console.log('[初始化] 开始初始化健康检查系统');
    
    // 保存配置
    this.currentConfig = config;
    this.globalHealthCheckEnabled = config.healthCheck?.enabled ?? true;
    
    console.log(`[初始化] 全局健康检查: ${this.globalHealthCheckEnabled ? '启用' : '禁用'}`);
    
    // 如果未启用全局健康检查，设置为离线状态
    if (!this.globalHealthCheckEnabled) {
      this.probeStatus = 'offline';
      this.initialized = true;
      this.notifyGlobalStateChange();
      console.log('[初始化] 全局健康检查未启用，设置为离线状态');
      return;
    }
    
    // 检查探针
    if (config.healthCheck?.probe?.host) {
      console.log(`[初始化] 检查探针: ${config.healthCheck.probe.host}`);
      await this.checkProbe(config.healthCheck.probe.host, config.healthCheck.probe.timeout || 3);
    } else {
      console.log('[初始化] 未配置探针，跳过探针检测');
      this.probeStatus = 'online'; // 如果没有配置探针，默认为在线
    }
    
    this.initialized = true;
    
    // 通知全局状态变更
    this.notifyGlobalStateChange();
    
    console.log(`[初始化] 初始化完成，探针状态: ${this.probeStatus}`);
    
    // 如果探针在线，延迟一点时间后开始检查服务
    if (this.probeStatus === 'online') {
      setTimeout(() => {
        this.startServiceChecks();
      }, 1000); // 延迟1秒，确保组件已经注册了监听器
    }
  }
  
  // 开始服务检查
  private static async startServiceChecks(): Promise<void> {
    if (!this.currentConfig) return;
    
    const services = this.currentConfig.items.filter(item => 
      (item.type === 'service' || item.type === 'application') && 
      (item as ServiceItem | ApplicationItem).healthCheck?.enabled
    ) as (ServiceItem | ApplicationItem)[];
    
    console.log(`[服务检查] 找到 ${services.length} 个需要检查的服务`);
    
    // 为每个服务设置初始checking状态并开始检查
    services.forEach((service, index) => {
      // 设置初始checking状态
      const checkingStatus: ServiceStatus = {
        id: service.id,
        status: 'checking',
        lastChecked: new Date(),
      };
      
      console.log(`[${service.id}] 设置初始checking状态`);
      this.notifyServiceStatusChange(service.id, checkingStatus);
      
      // 延迟一点时间后开始检查，避免同时发起太多请求
      const delay = index * 500 + 1000; // 每个服务延迟500ms，第一个延迟1秒
      setTimeout(() => {
        console.log(`[${service.id}] 开始执行健康检查`);
        this.checkServiceOnce(service.id);
      }, delay);
    });
  }
  
  // 检查探针状态
  private static async checkProbe(host: string, timeout: number = 3): Promise<void> {
    // host的请求协议，使用当前页面加载的实际协议
    const schema = window.location.protocol; // http:
    console.log(`[探针] 当前页面加载的实际协议: ${schema}`);
    console.log(`[探针] 开始检测探针: ${host}`);
    
    // 特殊处理本地主机
    if (host === '127.0.0.1' || host === 'localhost') {
      this.probeStatus = 'online';
      console.log(`[探针] 探针是本地主机 (${host})，自动视为可达`);
      return;
    }
    
    // 浏览器环境检查
    if (typeof window === 'undefined') {
      this.probeStatus = 'unknown';
      return;
    }
    
    // 如果探针主机是当前页面的主机名，也视为可达
    if (host === window.location.hostname || host === window.location.host.split(':')[0]) {
      this.probeStatus = 'online';
      console.log(`[探针] 探针是当前主机 (${host})，自动视为可达`);
      return;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
      
      // 尝试ping探针主机
      await fetch(`${schema}//${host}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      this.probeStatus = 'online';
      console.log(`[探针] 探针检测成功: ${host} 可达`);
    } catch (error) {
      // 对于no-cors模式，很多"错误"其实表示网络是通的
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.probeStatus = 'offline';
        console.log(`[探针] 探针检测超时: ${host}`);
      } else {
        // 对于其他错误，我们认为探针可能是可达的（可能是CORS或其他网络策略）
        this.probeStatus = 'online';
        console.log(`[探针] 探针可能可达 (网络错误但连接建立): ${host}`, error);
      }
    }
  }
  
  // 检查单个服务
  static async checkServiceOnce(itemId: string): Promise<void> {
    if (!this.currentConfig) {
      console.error(`[${itemId}] 配置未加载`);
      return;
    }
    
    if (this.probeStatus !== 'online') {
      console.log(`[${itemId}] 探针不在线，跳过检查`);
      return;
    }
    
    // 查找服务配置
    const service = this.currentConfig.items.find(item => 
      item.id === itemId && (item.type === 'service' || item.type === 'application')
    ) as ServiceItem | ApplicationItem | undefined;
    
    if (!service || !service.healthCheck?.enabled) {
      console.error(`[${itemId}] 服务配置不存在或未启用健康检查`);
      return;
    }
    
    console.log(`[${itemId}] 开始检查服务`);
    
    // 执行检查
    const url = service.healthCheck.url || service.url;
    const type = service.healthCheck.type || 'http';
    const host = service.healthCheck.host;
    const port = service.healthCheck.port;
    const timeout = service.healthCheck.timeout || 5;
    
    const startTime = Date.now();
    const result = await this.performServiceCheck(url, type, host, port, timeout);
    const responseTime = Date.now() - startTime;
    
    // 更新状态
    const newStatus: ServiceStatus = {
      id: itemId,
      status: result.status,
      lastChecked: new Date(),
      responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage
    };
    
    this.notifyServiceStatusChange(itemId, newStatus);
    console.log(`[${itemId}] 检查完成:`, newStatus);
  }
  
  // 执行服务检查
  private static async performServiceCheck(
    url: string, 
    type: 'http' | 'tcp' = 'http', 
    host?: string, 
    port?: number,
    timeout: number = 5
  ): Promise<{ status: 'online' | 'offline', statusCode?: number, errorMessage?: string }> {
    if (typeof window === 'undefined') {
      return { status: 'offline', errorMessage: 'Server-side' };
    }
    
    try {
      if (type === 'tcp' && host && port) {
        // TCP检查
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
        
        try {
          await fetch(`http://${host}:${port}`, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          return { status: 'online', statusCode: 200 };
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error instanceof DOMException && error.name === 'AbortError') {
            return { status: 'offline', errorMessage: 'Timeout' };
          }
          
          // 对于TCP检查，任何网络响应都认为端口可达
          return { status: 'online', statusCode: 0, errorMessage: 'CORS' };
        }
      } else {
        // HTTP检查
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
        
        try {
          // 先尝试普通请求
          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-cache'
          });
          
          clearTimeout(timeoutId);
          
          // 2xx, 3xx, 4xx都认为服务在线
          const isOnline = response.status >= 200 && response.status < 500;
          return { 
            status: isOnline ? 'online' : 'offline', 
            statusCode: response.status
          };
        } catch (error) {
          clearTimeout(timeoutId);
          
          // 超时错误
          if (error instanceof DOMException && error.name === 'AbortError') {
            return { status: 'offline', errorMessage: 'Timeout' };
          }
          
          // 尝试no-cors模式
          try {
            const noCorsController = new AbortController();
            const noCorsTimeoutId = setTimeout(() => noCorsController.abort(), timeout * 1000);
            
            await fetch(url, {
              method: 'HEAD',
              mode: 'no-cors',
              signal: noCorsController.signal,
              cache: 'no-cache'
            });
            
            clearTimeout(noCorsTimeoutId);
            return { 
              status: 'online', 
              statusCode: 0,
              errorMessage: 'CORS'
            };
          } catch (noCorsError) {
            if (noCorsError instanceof DOMException && noCorsError.name === 'AbortError') {
              return { status: 'offline', errorMessage: 'Timeout' };
            }
            
            return { 
              status: 'offline', 
              errorMessage: 'Connection failed'
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
  
  // 手动重新检查探针
  static async recheckProbe(): Promise<void> {
    if (!this.currentConfig?.healthCheck?.probe?.host) {
      console.log('[重新检查] 未配置探针');
      return;
    }
    
    console.log('[重新检查] 重新检查探针');
    
    const oldProbeStatus = this.probeStatus;
    await this.checkProbe(
      this.currentConfig.healthCheck.probe.host, 
      this.currentConfig.healthCheck.probe.timeout || 3
    );
    
    // 如果探针状态发生变化，通知全局状态变更
    if (oldProbeStatus !== this.probeStatus) {
      this.notifyGlobalStateChange();
      
      // 如果探针从离线变为在线，开始服务检查
      if (this.probeStatus === 'online') {
        this.startServiceChecks();
      }
    }
  }
  
  // 手动重新检查所有服务
  static async recheckAllServices(): Promise<void> {
    if (!this.currentConfig || this.probeStatus !== 'online') {
      console.log('[重新检查] 探针不在线或配置未加载，跳过服务检查');
      return;
    }
    
    const services = this.currentConfig.items.filter(item => 
      (item.type === 'service' || item.type === 'application') && 
      (item as ServiceItem | ApplicationItem).healthCheck?.enabled
    ) as (ServiceItem | ApplicationItem)[];
    
    console.log(`[重新检查] 重新检查 ${services.length} 个服务`);
    
    services.forEach((service, index) => {
      setTimeout(() => {
        this.checkServiceOnce(service.id);
      }, index * 200); // 每个服务间隔200ms
    });
  }
}
