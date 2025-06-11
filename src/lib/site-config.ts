import { Config } from '@/types/config';

// 默认配置
const defaultConfig: Config = {
  site: {
    favicon: "/favicon.ico",
    avatar: "/avatar.png",
    analytics: "",
    metadata: {
      title: "HomePage",
      description: "一个完全 AI 驱动的导航分享站",
      keywords: "导航, 个人, 服务, 管理, navigation, dashboard",
      author: "lc4t",
      language: "zh-CN"
    }
  },
  appearance: {
    theme: {
      auto: true,
      default: "light"
    },
    background: {
      type: "bing",
      value: "today",
      blur: 5,
      opacity: 0.8
    },
    card: {
      blur: 10,
      opacity: 0.15
    }
  },
  layout: {
    pinned: [],
    pinnedTags: [],
    groups: [],
    typeGroups: {}
  },
  export: {
    markdown: {
      template: "## {tag}\n\n{items}",
      item_format: "- [{title}]({url}) - {description}"
    }
  },
  items: []
};

// 导出默认配置
export default defaultConfig; 