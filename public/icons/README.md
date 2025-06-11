# Icons 目录说明

这个目录用于存放您的自定义图标资源。

## 目录结构建议

```
public/icons/
├── logos/          # 网站/服务Logo
│   ├── github.svg
│   ├── gitlab.png
│   └── custom-service.svg
├── categories/     # 分类图标
│   ├── development.svg
│   ├── design.svg
│   └── productivity.svg
├── badges/         # 自定义徽章
│   └── status.svg
└── custom/         # 其他自定义图标
    └── special.png
```

## 使用方法

### 在配置文件中引用

```yaml
# 引用 public/icons/ 下的文件
icon:
  type: svg
  value: "/icons/logos/github.svg"

# 或使用自动模式
icon:
  type: auto
  value: "/icons/categories/development.svg"
```

### 支持的文件格式

- **SVG** - 推荐，矢量图标，支持颜色继承
- **PNG** - 位图格式，适合复杂图标
- **WebP** - 现代格式，文件更小
- **ICO** - 传统favicon格式

## 最佳实践

1. **文件命名**: 使用小写字母和连字符，如 `my-service.svg`
2. **SVG优化**: 使用工具压缩SVG文件，移除不必要的元素
3. **尺寸建议**: 图标建议24x24或32x32像素
4. **颜色**: SVG图标建议使用`currentColor`继承主题色

## 示例图标

您可以从以下网站获取高质量图标：
- [Simple Icons](https://simpleicons.org/) - 品牌图标
- [Heroicons](https://heroicons.com/) - 通用图标
- [Feather Icons](https://feathericons.com/) - 线性图标
- [Lucide](https://lucide.dev/) - 现代图标库
