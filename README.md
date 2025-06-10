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

1. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **等待构建完成**
   - 查看 Actions 页面的构建状态
   - 构建完成后访问 `https://your-username.github.io/homepage`

## 📝 配置说明

### 基本配置

编辑 `public/config/site.yaml` 文件：

```yaml
site:
  title: "我的导航站" # 网站标题
  description: "Personal Navigation Hub" # 网站描述
  author: "Your Name" # 作者名称

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
2. **自定义组件**：在 `src/components/` 中创建组件
3. **工具函数**：在 `src/lib/` 中添加功能函数

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
