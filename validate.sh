#!/bin/bash

echo "🚀 验证个人导航站项目..."

# 检查 Node.js 和 npm
echo "📋 检查环境..."
node --version
npm --version

# 检查配置文件
echo "📝 验证配置文件..."
npm run validate-config

if [ $? -ne 0 ]; then
    echo "❌ 配置文件验证失败"
    exit 1
fi

# 类型检查
echo "🔍 TypeScript 类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ 类型检查失败"
    exit 1
fi

# 代码检查
echo "🧹 ESLint 检查..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  代码检查有警告，但继续构建..."
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目验证成功！"
echo "📁 构建输出在 out/ 目录"
echo "🌐 可以使用 'npm run preview' 预览站点"
