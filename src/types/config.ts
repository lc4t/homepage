// 图标配置类型
export interface IconConfig {
  // 图标类型
  type: 'auto' | 'emoji' | 'path' | 'url' | 'text' | 'favicon' | 'badge' | 'svg';
  // 图标内容/路径
  value?: string;
  // SVG内容（当type为'svg'时）
  svg?: string;
  // Badge配置（当type为'badge'时）
  badge?: {
    style?: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social';
    label?: string;
    message?: string;
    color?: string;
    labelColor?: string;
    logo?: string;
  };
  // 保底图标
  fallback?: {
    type: 'emoji' | 'text';
    value: string;
  };
}

// 网站配置类型
export interface SiteConfig {
  // 以下字段移动到metadata中，但保留为可选项以兼容旧配置
  title?: string;
  description?: string;
  author?: string;
  analytics?: string;
  // 网站图标
  favicon?: string;
  // 头像图片路径
  avatar?: string;
  // 元数据配置
  metadata: {
    title: string;
    description: string;
    keywords?: string;
    author: string;
    language?: string;
  };
  // 个人链接
  links?: {
    github?: string;
    blog?: string;
    custom?: Array<{
      name: string;
      url: string;
      icon?: IconConfig | string; // 支持新的IconConfig或字符串（兼容性）
    }>;
  };
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
  // 置顶标签（优先显示）
  pinnedTags?: string[];
  groups: Array<{
    name: string;
    tags: string[];
    priority: number;
  }>;
  // 类型分组配置 - 允许任意字符串键
  typeGroups?: Record<string, {
    title: string;  // 显示名称
    priority: number; // 显示顺序
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
  indent?: number; // 缩进级别，默认为0（不缩进）
  isHeader?: boolean; // 是否为小标题
}

// 分享列表项目类型
export interface SharedListItem {
  id: string;
  text: string;
  url: string;
}

// 基础项目类型
interface BaseItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon?: IconConfig | string; // 支持新的IconConfig或字符串（兼容性）
  type: string; // 允许任意类型字符串
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

// 分享列表项目类型
export interface SharedListItemConfig extends BaseItem {
  type: 'sharedlist';
  items: SharedListItem[];
}

// 其他类型项目
export interface CustomItemConfig extends BaseItem {
  [key: string]: string | number | boolean | string[] | IconConfig | HealthCheckConfig | undefined; // 允许任意额外属性，但限制类型
}

// 联合项目类型
export type Item = WebsiteItem | ServiceItem | ChecklistItemConfig | SharedListItemConfig | CustomItemConfig;

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
