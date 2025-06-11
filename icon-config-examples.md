# 图标配置示例

这个文件展示了如何在您的导航站中使用新的图标系统。

## 重要改进

### 📁 统一图标管理
所有自定义图标建议放在 `public/icons/` 目录中，便于管理：
```
public/icons/
├── logos/          # 网站/服务Logo  
├── categories/     # 分类图标
├── badges/         # 自定义徽章
└── custom/         # 其他自定义图标
```

### 🚀 智能favicon获取
对于 `website` 和 `service` 类型，如果没有配置 `icon` 字段，系统会：
1. 自动尝试获取网站的 favicon.ico
2. 失败后尝试多个备选方案（icon.horse、Google favicon等）
3. 最终保底使用首字母

### ⚠️ 重要变更：Emoji 使用方式
**不再支持在 `icon` 字段中直接使用 emoji 字符串！**

```yaml
# ❌ 错误用法（不再支持）
icon: "🚀"

# ✅ 正确用法
icon:
  type: "emoji"
  value: "🚀"
```

## 基本语法

### 1. 字符串格式（仅支持文件路径）
```yaml
# 本地图标（推荐）- 自动添加/icons/前缀
icon: "logos/github.svg"          # 实际路径: /icons/logos/github.svg
icon: "categories/development.svg" # 实际路径: /icons/categories/development.svg

# 绝对路径
icon: "/local-icon.svg"
icon: "https://example.com/icon.png"

# 注意：emoji 不再支持字符串格式，需使用对象格式
```

### 2. 对象格式（推荐）

#### 自动模式（推荐用于website/service）
```yaml
icon:
  type: auto
  # 可以是文件路径、URL或文本
  value: "logos/github.svg"
  # 保底图标（可选）
  fallback:
    type: text
    value: "G"
```

#### 自动获取Favicon
```yaml
# 对于website和service类型，如果不设置icon，会自动从URL获取favicon
# 或者显式设置：
icon:
  type: favicon
  # 可选：自定义favicon URL
  value: "https://example.com/custom-favicon.ico"
```

#### SVG图标
```yaml
# 使用SVG URL
icon:
  type: svg
  value: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg"

# 或直接内嵌SVG内容
icon:
  type: svg
  svg: '<svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>'
```

#### Badge图标（如shields.io）
```yaml
icon:
  type: badge
  badge:
    style: flat-square  # flat, flat-square, plastic, for-the-badge, social
    label: "version"    # 左侧标签（可选）
    message: "v1.0.0"   # 右侧消息
    color: "blue"       # 右侧颜色
    labelColor: "lightgrey"  # 左侧颜色（可选）
    logo: "github"      # 品牌logo（可选）

# 或者简化版本
icon:
  type: badge
  badge:
    message: "GitHub"
    color: "black"
    logo: "github"
```

#### Emoji图标
```yaml
icon:
  type: emoji
  value: "🚀"
```

#### 文本图标
```yaml
icon:
  type: text
  value: "API"  # 只会显示首字母"A"
```

## 完整配置示例

```yaml
site:
  title: "我的导航站"
  description: "Personal Navigation Hub"
  links:
    github: "https://github.com/username"
    blog: "https://blog.example.com"
    custom:
      - name: "Docker Hub"
        url: "https://hub.docker.com/u/username"
        icon:
          type: badge
          badge:
            message: "Docker"
            color: "2496ED"
            logo: "docker"
      - name: "状态页"
        url: "https://status.example.com"
        icon:
          type: svg
          value: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/statuspage.svg"

items:
  # 自动获取favicon的网站（推荐用法）
  - id: "github"
    type: "website"
    title: "GitHub"
    description: "代码托管平台"
    url: "https://github.com"
    tags: ["开发", "代码"]
    # 不设置icon，会自动从github.com获取favicon

  # 使用本地图标（推荐用法）
  - id: "development-tools"
    type: "website"
    title: "开发工具"
    description: "开发相关工具集合"
    url: "https://devtools.example.com"
    tags: ["开发", "工具"]
    icon: "categories/development.svg"  # 自动解析为 /icons/categories/development.svg

  # 使用emoji图标（新格式）
  - id: "ai-tools"
    type: "website"
    title: "AI工具"
    description: "AI相关工具和服务"
    url: "https://ai-tools.example.com"
    tags: ["ai", "工具"]
    icon:
      type: emoji
      value: "🤖"

  # 使用本地Logo
  - id: "my-service"
    type: "service"
    title: "我的服务"
    description: "自定义服务"
    url: "https://myservice.example.com"
    tags: ["服务"]
    icon:
      type: auto
      value: "logos/my-service.svg"  # 自动解析为 /icons/logos/my-service.svg
      fallback:
        type: text
        value: "MS"

  # 使用自定义favicon
  - id: "custom-site"
    type: "website"
    title: "自定义网站"
    description: "使用自定义图标"
    url: "https://example.com"
    tags: ["网站"]
    icon:
      type: favicon
      value: "https://example.com/custom-icon.png"

  # 使用badge图标的API服务
  - id: "api-service"
    type: "service"
    title: "API服务"
    description: "RESTful API接口"
    url: "https://api.example.com"
    tags: ["API", "服务"]
    icon:
      type: badge
      badge:
        label: "API"
        message: "v2.0"
        color: "green"
        style: "flat-square"

  # 使用SVG图标的工具
  - id: "monitoring"
    type: "service"
    title: "监控系统"
    description: "系统监控和告警"
    url: "https://monitor.example.com"
    tags: ["监控", "运维"]
    icon:
      type: svg
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'

  # 使用emoji的清单
  - id: "todo"
    type: "checklist"
    title: "待办事项"
    description: "日常任务清单"
    tags: ["任务", "清单"]
    icon:
      type: emoji
      value: "📝"
    items:
      - id: "task1"
        text: "完成项目文档"
        completed: false

  # 自动模式（推荐）
  - id: "auto-example"
    type: "website"
    title: "本地图标示例"
    description: "使用本地图标文件"
    url: "https://example.com"
    tags: ["示例"]
    icon:
      type: auto
      value: "categories/productivity.svg"  # 会被解析为SVG文件
      fallback:
        type: text
        value: "P"
```

## 本地图标管理（新特性！）

### 📁 目录结构
建议将所有自定义图标放在 `public/icons/` 目录中：

```
public/icons/
├── logos/
│   ├── github.svg
│   ├── my-service.png
│   └── custom-api.svg
├── categories/
│   ├── development.svg     # 已提供示例文件
│   ├── design.svg
│   └── productivity.svg
├── badges/
│   └── status.svg
└── custom/
    └── special.png
```

### 🚀 自动路径解析
当您使用相对路径时，系统会自动添加 `/icons/` 前缀：

```yaml
# 简化写法
icon: "logos/github.svg"
# 等同于
icon: "/icons/logos/github.svg"

# 在对象配置中也是如此
icon:
  type: auto
  value: "categories/development.svg"
# 等同于
icon:
  type: auto
  value: "/icons/categories/development.svg"
```

### 🎨 支持的文件格式
- **SVG** - 推荐，矢量图标，支持颜色继承
- **PNG** - 位图格式，适合复杂图标
- **WebP** - 现代格式，文件更小
- **ICO** - 传统favicon格式

### ✨ 优势
1. **统一管理** - 所有图标在一个目录中
2. **版本控制** - 图标可以和git一起管理
3. **性能优化** - 本地图标加载更快
4. **离线可用** - 不依赖外部服务

## 图标优先级

1. **自定义icon配置** - 如果设置了icon字段
2. **自动favicon** - 从URL自动获取favicon
3. **保底图标** - 使用首字母

## 注意事项

1. **SVG安全性**: 直接内嵌的SVG内容会通过dangerouslySetInnerHTML渲染，请确保内容安全
2. **Badge限制**: Badge图标依赖shields.io服务，需要网络连接
3. **Favicon获取**: 使用icon.horse服务获取favicon，可能有延迟
4. **兼容性**: 旧的字符串格式仍然支持，会自动转换为auto模式

## 常用Badge配置

```yaml
# GitHub仓库
icon:
  type: badge
  badge:
    message: "GitHub"
    color: "black"
    logo: "github"

# NPM包
icon:
  type: badge
  badge:
    label: "npm"
    message: "v1.0.0"
    color: "red"
    logo: "npm"

# Docker镜像
icon:
  type: badge
  badge:
    message: "Docker"
    color: "2496ED"
    logo: "docker"

# 在线状态
icon:
  type: badge
  badge:
    message: "online"
    color: "brightgreen"

# 版本信息
icon:
  type: badge
  badge:
    label: "version"
    message: "2.1.0"
    color: "blue"
```
