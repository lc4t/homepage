# 📚 GitHub Pages 双环境部署完整指南

## 🎯 概述

您的项目现在配置了两个独立的 GitHub Pages 环境：

- **🌟 生产环境** (`main` 分支) - 稳定版本
- **🚀 开发环境** (`dev` 分支) - 测试版本，带有视觉标识

## ⚡ 快速开始

### 1. 运行自动设置脚本
```bash
# 给脚本添加执行权限
chmod +x setup-pages.sh

# 运行设置脚本
./setup-pages.sh
```

### 2. 手动设置 GitHub Pages

#### 设置生产环境 (推荐使用 GitHub Actions)
1. 进入仓库 **Settings** > **Pages**
2. Source 选择: **GitHub Actions**
3. 等待自动部署完成

#### 设置开发环境 (使用 gh-pages-dev 分支)
1. 在同一个 Pages 设置页面
2. 可以创建多个 Pages 部署
3. 或者在需要时切换分支来查看开发版本

## 🔄 工作流程

### 日常开发
```bash
# 1. 切换到开发分支
git checkout dev

# 2. 开发新功能
# ... 编写代码 ...

# 3. 提交并推送 (自动触发开发环境部署)
git add .
git commit -m "feat: 新功能"
git push origin dev

# 4. 在开发环境测试
# 访问开发版本页面进行测试

# 5. 测试通过后合并到主分支
git checkout main
git merge dev
git push origin main  # 自动触发生产环境部署
```

### 自动化特性

#### 每次推送到 `dev` 分支时：
- ✅ 自动构建项目
- ✅ 添加开发版本标识（橙色横幅）
- ✅ 部署到 `gh-pages-dev` 分支
- ✅ 在 Actions 页面显示详细报告

#### 每次推送到 `main` 分支时：
- ✅ 自动构建项目
- ✅ 添加生产版本标识
- ✅ 部署到官方 GitHub Pages
- ✅ 在 Actions 页面显示详细报告

## 🎨 版本区别

### 开发版本特征
- 🟠 顶部显示橙色 "开发版本" 横幅
- 📅 显示构建时间和提交信息
- 🔍 浏览器控制台包含详细调试信息
- 📍 页面自动下移 40px 避免内容遮挡

### 生产版本特征
- 🌟 干净的界面，无额外标识
- 🔍 控制台仅显示基本构建信息
- 🚀 优化的性能和加载速度

## 📊 监控和调试

### 查看部署状态
1. **GitHub Actions**: `https://github.com/你的用户名/homepage/actions`
2. **部署历史**: Actions 页面查看每次部署的详细日志
3. **实时状态**: 每次部署后会显示详细的摘要报告

### 常见问题诊断

#### 部署失败
- 检查 Actions 页面的错误日志
- 确认 `package.json` 中的构建脚本正确
- 验证代码语法无错误

#### 页面不更新
- 检查分支是否正确推送
- 清除浏览器缓存
- 确认 Pages 设置中的分支配置

#### 样式异常
- 检查构建输出目录 (`out` 文件夹)
- 验证 CSS 文件是否正确生成
- 查看浏览器开发者工具的网络请求

## 🔧 高级配置

### 环境变量
在 GitHub Actions 中可以设置不同的环境变量：
```yaml
env:
  NEXT_OUTPUT: export
  GITHUB_ACTIONS: true
  NODE_ENV: production  # 或 development
```

### 自定义域名
如需使用自定义域名：
1. 在 Pages 设置中配置自定义域名
2. 在仓库根目录添加 `CNAME` 文件
3. 配置 DNS 记录指向 GitHub Pages

### 缓存优化
项目已配置：
- 🚀 npm 缓存加速构建
- 📦 静态资源优化
- 🔄 增量构建支持

## 🎯 最佳实践

1. **分支管理**
   - `main`: 仅合并经过测试的稳定代码
   - `dev`: 日常开发和功能测试
   - 避免直接在 `main` 分支开发

2. **部署策略**
   - 优先在开发环境测试新功能
   - 确认无误后再合并到生产环境
   - 利用自动部署减少手动操作

3. **版本控制**
   - 每个重要功能使用明确的提交信息
   - 利用构建时间戳追踪版本
   - 保持开发和生产环境同步

## 📞 支持和反馈

- 📖 查看 GitHub Actions 日志排查问题
- 🔍 检查浏览器控制台获取调试信息
- 📚 参考 Next.js 和 GitHub Pages 官方文档

---

**🚀 现在您可以享受自动化的双环境部署流程了！**

每次推送都会自动构建和部署，大大提升开发效率！
