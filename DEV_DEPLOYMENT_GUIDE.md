# GitHub Pages 开发分支部署指南

## 📋 概述

这个项目配置了两个独立的 GitHub Pages 部署：
- **主分支** (`main`): 生产环境 
- **开发分支** (`dev`): 开发测试环境

## 🚀 自动部署流程

### Dev 分支部署
每当您向 `dev` 分支推送代码时，GitHub Actions 将自动：

1. 🔨 构建项目
2. 🏷️ 添加开发版本标识（顶部橙色横幅）
3. 📦 部署到 `gh-pages-dev` 分支
4. 📊 生成详细的部署报告

## ⚙️ 设置步骤

### 首次设置 Dev Pages

1. **进入仓库设置**
   ```
   GitHub 仓库 → Settings → Pages
   ```

2. **配置 Dev Pages**
   - Source: `Deploy from a branch`
   - Branch: `gh-pages-dev`
   - Folder: `/ (root)`
   - 点击 `Save`

3. **等待部署完成**
   - 通常需要几分钟时间
   - 可以在 Actions 标签页查看部署进度

### 访问地址

- **生产环境**: `https://你的用户名.github.io/homepage/`
- **开发环境**: 与生产环境相同，但需要在 Pages 设置中切换分支

## 🎨 开发版本特性

### 视觉区别
- ✅ 顶部显示橙色 "开发版本" 横幅
- ✅ 包含最后更新时间
- ✅ 页面自动下移避免遮挡内容

### 调试信息
- 🔍 浏览器控制台显示构建信息
- 📅 包含构建时间和提交哈希
- 🔗 便于问题追踪和版本识别

## 🔄 工作流程建议

### 开发流程
```bash
# 1. 在 dev 分支开发
git checkout dev
git add .
git commit -m "feat: 新功能开发"
git push origin dev

# 2. 查看 GitHub Actions 自动部署

# 3. 在开发环境测试
# 访问: https://你的用户名.github.io/homepage/

# 4. 测试通过后合并到主分支
git checkout main
git merge dev
git push origin main
```

### 分支管理
- **dev**: 日常开发、功能测试
- **main**: 稳定版本、生产部署

## 📝 部署信息

### 构建环境
- Node.js 18
- Next.js 静态导出
- Tailwind CSS

### 部署状态检查
1. **GitHub Actions**: 查看构建日志
2. **Pages 设置**: 确认部署分支
3. **浏览器**: 检查页面是否正常加载

## 🔧 故障排除

### 常见问题

**Q: dev 分支推送后没有自动部署？**
A: 检查 GitHub Actions 权限和工作流程状态

**Q: 页面显示 404 错误？**
A: 确认 Pages 设置中选择了正确的分支

**Q: 样式或功能异常？**
A: 检查浏览器控制台错误信息

### 调试步骤
1. 查看 Actions 页面的构建日志
2. 确认 `gh-pages-dev` 分支存在且有内容
3. 检查 Pages 设置配置
4. 清除浏览器缓存后重试

## 🎯 最佳实践

1. **频繁推送**: 利用自动部署频繁测试
2. **版本标识**: 开发版本会自动添加时间戳
3. **并行开发**: 可以同时维护生产和开发环境
4. **及时合并**: 测试通过的功能及时合并到主分支

## 📞 支持

如果遇到部署问题，可以：
1. 查看 GitHub Actions 日志
2. 检查 Issues 页面的相关讨论
3. 参考 GitHub Pages 官方文档

---
*🚀 Happy Coding! 每次推送都是一次进步！*
