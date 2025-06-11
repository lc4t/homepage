# 🚀 图标系统快速开始

## 立即体验新功能

### 1. 自动 Favicon（推荐）
对于 website 和 service 类型，不配置 icon 字段即可自动获取：

```yaml
items:
  - id: "github"
    type: "website"
    title: "GitHub"
    url: "https://github.com"
    # 自动从 github.com 获取 favicon
```

### 2. 本地图标管理
将图标放在 `public/icons/` 目录中，使用简化路径：

```yaml
items:
  - id: "dev-tools"
    type: "website"
    title: "开发工具"
    url: "https://example.com"
    icon: "categories/development.svg"  # 自动解析为 /icons/categories/development.svg
```

### 3. Badge 状态显示
展示服务状态或版本信息：

```yaml
items:
  - id: "api"
    type: "service"
    title: "API 服务"
    url: "https://api.example.com"
    icon:
      type: badge
      badge:
        label: "API"
        message: "v2.0"
        color: "green"
```

## 📁 目录结构

```
public/icons/
├── categories/
│   ├── development.svg    ✅ 已提供
│   ├── design.svg         ✅ 已提供
│   └── productivity.svg   ✅ 已提供
├── logos/              📁 放置服务Logo
├── badges/             📁 自定义徽章
└── custom/             📁 其他图标
```

## 🎯 三种使用方式

### 简单模式（推荐新手）
```yaml
# 直接使用文件名，自动处理路径
icon: "categories/development.svg"
```

### 自动模式（推荐进阶）  
```yaml
icon:
  type: auto
  value: "logos/my-service.svg"
  fallback:
    type: text
    value: "MS"
```

### 完全自动（推荐 website/service）
```yaml
# 不配置 icon，系统自动获取 favicon
# 适用于 GitHub、Google 等知名网站
```

## 🛠️ 快速测试

1. **重启服务**：
   ```bash
   rm -rf .next && npm run dev
   ```

2. **验证功能**：
   - 检查现有图标是否正常
   - 添加一个 website 类型项目（不配置 icon）
   - 尝试使用 `categories/development.svg`

3. **查看效果**：
   - 自动获取的 favicon
   - 本地图标的显示
   - 错误时的保底机制

## 💡 提示

- 🔄 **向后兼容**：所有旧配置继续有效
- 🎨 **SVG 推荐**：矢量图标支持主题色继承  
- 🚀 **性能优化**：本地图标加载更快
- 🛡️ **容错机制**：网络问题时自动降级

---

现在开始使用更强大的图标系统吧！🎉
