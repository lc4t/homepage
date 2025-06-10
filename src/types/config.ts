// 网站配置类型
export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  analytics?: string;
}

// 外观配置类型
export interface AppearanceConfig {
  theme: {
    auto: boolean;
    default: 'light' | 'dark';
  };
  background: {
    type: 'bing' | 'color' | 'image' | 'url';
    value: string;
    blur: number;
    opacity: number;
  };
  card: {
    blur: number;
    opacity: number;
  };
}

// 布局配置类型
export interface LayoutConfig {
  pinned: string[];
  groups: Array<{
    name: string;
    tags: string[];
    priority: number;
  }>;
}

// 导出配置类型
export interface ExportConfig {
  markdown: {
    template: string;
    item_format: string;
  };
}

// 健康检查配置类型
export interface HealthCheckConfig {
  enabled: boolean;
  type: 'http' | 'tcp';
  url?: string;
  host?: string;
  port?: number;
  interval: number;
  timeout: number;
}

// 清单项目类型
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// 基础项目类型
interface BaseItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon?: string;
}

// 网站项目类型
export interface WebsiteItem extends BaseItem {
  type: 'website';
  url: string;
}

// 服务项目类型
export interface ServiceItem extends BaseItem {
  type: 'service';
  url: string;
  healthCheck?: HealthCheckConfig;
}

// 清单项目类型
export interface ChecklistItemConfig extends BaseItem {
  type: 'checklist';
  items: ChecklistItem[];
}

// 联合项目类型
export type Item = WebsiteItem | ServiceItem | ChecklistItemConfig;

// 完整配置类型
export interface Config {
  site: SiteConfig;
  appearance: AppearanceConfig;
  layout: LayoutConfig;
  export: ExportConfig;
  items: Item[];
}

// 服务状态类型
export interface ServiceStatus {
  id: string;
  status: 'online' | 'offline' | 'checking' | 'unknown';
  lastChecked: Date;
  responseTime?: number;
}

// 清单状态类型（存储在localStorage）
export interface ChecklistState {
  [itemId: string]: {
    [checklistItemId: string]: boolean;
  };
}
