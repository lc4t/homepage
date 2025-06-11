# 个人导航站 | Personal Navigation Hub

一个现代化的个人导航站点，支持网站导航、服务监控、清单管理等功能。使用 Next.js 构建，支持静态部署到 GitHub Pages。

## ✨ 特性

- 🚀 **极速加载**：基于Next.js构建，支持静态导出
- 🌙 **自动深色模式**：根据时间自动切换主题
- 🎨 **自定义背景**：支持Bing今日图片、自定义图片、纯色背景
- 🔍 **快速搜索**：支持快捷键搜索（按下 `/` 键）
- 📱 **响应式设计**：完美适配各种设备
- 🔧 **简单配置**：通过YAML文件轻松配置
- 🔄 **健康检查**：监控服务状态
- ✅ **待办清单**：支持简单的待办事项管理
- 📊 **服务监控**：实时检查内网服务状态
- ✅ **清单管理**：支持 TODO 清单，可导出 Markdown
- 📤 **一键导出**：支持按标签导出项目为 Markdown
- ⚡ **毛玻璃效果**：现代化的 UI 设计

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/homepage.git
   cd homepage
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置网站**
   编辑 `public/config/site.yaml` 文件，添加你的导航项目

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问网站**
   打开 [http://localhost:3000](http://localhost:3000)

### 部署到 GitHub Pages

#### 🌟 部署支持

本项目支持部署到 GitHub Pages，可以使用默认的 GitHub Pages 域名或自定义域名。

#### ⚡ 快速设置（推荐）

```bash
# 给设置脚本添加执行权限
chmod +x setup-pages.sh

# 运行自动设置脚本
./setup-pages.sh
```

#### 🔧 手动设置

1. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

#### 📊 部署特性

- **自动构建**: 每次推送自动触发部署
- **详细日志**: Actions 页面提供完整的部署报告

### 🌐 配置自定义域名

1. **创建 CNAME 文件**
   - 在 `public` 目录下创建 `CNAME` 文件
   - 文件内容为您的自定义域名，例如 `homepage.example.com`

2. **配置 DNS 设置**
   - 在您的 DNS 提供商处添加 CNAME 记录，将您的自定义域名指向 `username.github.io`
   - 或添加 A 记录指向 GitHub Pages 的 IP 地址：
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **启用 HTTPS**
   - 在仓库 Settings → Pages 中勾选 "Enforce HTTPS"
   - 可能需要等待几小时 DNS 传播和证书颁发

> 📚 **详细说明**: 查看 `README_PAGES_SETUP.md` 获取完整的部署指南

## 📝 配置说明

### 基本配置

编辑 `public/config/site.yaml` 文件：

```yaml
site:
  title: "我的导航站" # 网站标题
  description: "Personal Navigation Hub" # 网站描述
  author: "Your Name" # 作者名称
  favicon: "/favicon.png" # 网站图标（支持相对路径或绝对URL）
  avatar: "/avatar.png" # 头像图片（可选）

appearance:
  theme:
    auto: true # 是否根据时间自动切换主题
    default: "light" # 默认主题：light/dark
  background:
    type: "bing" # 背景类型
    value: "today" # 背景值
    blur: 0 # 背景模糊度
    opacity: 0.8 # 背景不透明度
  card:
    blur: 10 # 卡片模糊度
    opacity: 0.1 # 卡片不透明度
```

### 布局配置

```yaml
layout:
  # 置顶项目（显示在最前面）
  pinned:
    - "github"
    - "gmail"
  
  # 置顶标签（标签筛选时优先显示）
  pinnedTags:
    - "ai"
    - "dev"
    - "service"
  
  # 自定义标签分组（按标签对项目分组）
  groups:
    - name: "AI工具"
      tags: ["ai", "tool"]
      priority: 1
    - name: "开发工具"
      tags: ["dev", "tool"]
      priority: 2
  
  # 类型分组配置（按类型对项目分组）
  typeGroups:
    website:
      title: "常用网站"
      priority: 1
    service:
      title: "服务监控"
      priority: 2
    checklist:
      title: "任务清单"
      priority: 3
```

说明：
- `pinned`: 置顶项目，这些项目会显示在最前面
- `pinnedTags`: 置顶标签，这些标签会在筛选栏中优先显示
- `groups`: 按标签对项目进行分组（用于未来功能）
- `typeGroups`: 按类型对项目进行分组（当前用于主页显示）

### 添加项目

#### 网站项目
```yaml
items:
  - id: "claude-ai"
    type: "website"
    title: "Claude"
    url: "https://claude.ai"
    description: "AI智能助手"
    tags: ["ai", "tool"]
```

#### 服务监控
```yaml
  - id: "my-nas"
    type: "service"
    title: "NAS服务器"
    url: "http://192.168.1.100:8080"
    description: "家庭私有云"
    tags: ["service", "nas"]
    healthCheck:
      enabled: true
      type: "http"
      interval: 60
```

#### TODO 清单
```yaml
  - id: "learn-list"
    type: "checklist"
    title: "学习清单"
    description: "技术学习计划"
    tags: ["learn"]
    items:
      - id: "react"
        text: "学习 React 18"
        completed: false
      - id: "nextjs"
        text: "# 前端框架"
        isHeading: true
      - id: "nextjs-basics"
        text: "Next.js 基础"
        completed: false
```

#### 分享列表
```yaml
  - id: "video-tutorials"
    type: "sharedlist"
    title: "视频教程合集"
    description: "收集的学习视频和教程链接"
    tags: ["video", "learning"]
    items:
      - id: "nextjs-course"
        text: "Next.js 完整教程"
        url: "https://www.youtube.com/watch?v=example"
      - id: "react-hooks"
        text: "React Hooks 深度解析"
        url: "https://www.bilibili.com/video/example"
```

## 🛠️ 自定义开发

### 项目结构

```
homepage/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React 组件
│   ├── lib/             # 工具函数
│   └── types/           # TypeScript 类型
├── public/
│   └── config/          # 配置文件
└── .github/workflows/   # GitHub Actions
```

### 可用命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建结果
- `npm run lint` - 代码检查
- `npm run validate-config` - 验证 YAML 配置

### 添加新功能

1. **新的项目类型**：在 `src/types/config.ts` 中添加类型定义
2. **新的组件**：在 `src/components` 中创建组件
3. **新的工具函数**：在 `src/lib` 中添加

## 🎨 设计理念

- **Apple 风格**：简洁、现代的设计语言
- **毛玻璃效果**：半透明背景和背景模糊
- **紧凑布局**：一屏显示更多内容
- **直观交互**：清晰的视觉反馈

## 🔧 故障排除

### 常见问题

1. **配置加载失败**
   - 检查 `public/config/site.yaml` 语法
   - 运行 `npm run validate-config` 验证配置

2. **图标不显示**
   - 检查网站 URL 是否正确
   - 某些网站可能阻止外部访问 favicon

3. **服务监控不工作**
   - 浏览器 CORS 策略限制内网请求
   - 建议使用支持 CORS 的反向代理

4. **部署失败**
   - 检查 GitHub Actions 日志
   - 确保仓库设置了 Pages 权限

### 性能优化

- 使用 CDN 加速静态资源
- 压缩背景图片大小
- 减少不必要的项目数量

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide Icons](https://lucide.dev/) - 图标库
- [Bing](https://www.bing.com/) - 每日图片

---

如果这个项目对你有帮助，请给个 ⭐ Star！
