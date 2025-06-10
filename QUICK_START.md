# 🚀 快速开始指南

## 第一步：安装和运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **访问网站**
   打开 [http://localhost:3000](http://localhost:3000)

## 第二步：配置你的导航站

编辑 `public/config/site.yaml` 文件：

### 基本信息
```yaml
site:
  title: "我的导航站"
  description: "个人导航中心"
  author: "你的名字"
```

### 背景设置
```yaml
appearance:
  background:
    type: "unsplash"           # 使用 Unsplash 图片
    value: "landscape,nature"  # 搜索关键词
    opacity: 0.8              # 透明度
```

### 添加网站
```yaml
items:
  - id: "github"
    type: "website"
    title: "GitHub"
    url: "https://github.com"
    description: "代码托管平台"
    tags: ["dev", "tool"]
```

### 添加清单
```yaml
  - id: "todo"
    type: "checklist"
    title: "待办事项"
    description: "今日任务"
    tags: ["personal"]
    items:
      - id: "task1"
        text: "完成项目文档"
        completed: false
```

## 第三步：验证配置

```bash
# 验证 YAML 配置文件
npm run validate-config

# 类型检查
npm run type-check

# 完整验证（Linux/macOS）
chmod +x validate.sh
./validate.sh
```

## 第四步：构建和部署

### 本地构建
```bash
npm run build
npm run preview
```

### 部署到 GitHub Pages
1. 推送代码到 GitHub
2. 在仓库设置中启用 Pages
3. 选择 "GitHub Actions" 作为源
4. 等待自动构建完成

## 常用功能

### 🎨 主题切换
- 点击右上角太阳/月亮图标切换主题
- 右键点击可开启自动主题（根据时间）

### 🔍 搜索筛选
- 搜索框支持标题、描述、标签搜索
- 点击标签快速筛选
- 支持导出筛选结果为 Markdown

### ✅ 清单管理
- 点击清单卡片打开详情
- 勾选/取消勾选任务
- 一键导出为 Markdown

### 📊 服务监控
- 自动检测内网服务状态
- 显示在线/离线状态指示器

## 自定义配置

### 背景类型
- `unsplash`: Unsplash 图片
- `color`: 纯色背景
- `url`: 网络图片 URL
- `image`: 本地图片路径

### 项目类型
- `website`: 普通网站链接
- `service`: 需要监控的服务
- `checklist`: 待办清单

### 标签分组
```yaml
layout:
  pinned: ["重要项目ID"]
  groups:
    - name: "开发工具"
      tags: ["dev"]
      priority: 1
```

## 故障排除

### 配置文件错误
- 使用 `npm run validate-config` 检查语法
- 确保缩进使用空格而不是制表符

### 图标不显示
- 检查网站 URL 是否正确
- 某些网站可能阻止外部访问 favicon

### 服务监控不工作
- 浏览器安全策略限制跨域请求
- 建议在内网环境使用

需要更多帮助？查看完整文档 [README.md](README.md)
