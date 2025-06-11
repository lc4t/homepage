#!/bin/bash

# GitHub Pages 双环境设置脚本
# 用于快速设置生产和开发环境的 GitHub Pages

echo "🚀 GitHub Pages 双环境设置脚本"
echo "==============================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取当前仓库信息
REPO_URL=$(git remote get-url origin 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 错误: 当前目录不是 Git 仓库${NC}"
    exit 1
fi

# 提取仓库名和用户名
REPO_INFO=$(echo $REPO_URL | sed 's/.*github\.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')
USERNAME=$(echo $REPO_INFO | cut -d'/' -f1)
REPONAME=$(echo $REPO_INFO | cut -d'/' -f2)

echo -e "${BLUE}📍 检测到仓库: ${USERNAME}/${REPONAME}${NC}"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 当前分支: ${CURRENT_BRANCH}${NC}"

# 检查 dev 分支是否存在
DEV_EXISTS=$(git branch -r | grep "origin/dev" | wc -l)
if [ $DEV_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  dev 分支不存在，正在创建...${NC}"
    git checkout -b dev
    git push -u origin dev
    echo -e "${GREEN}✅ dev 分支已创建并推送${NC}"
else
    echo -e "${GREEN}✅ dev 分支已存在${NC}"
fi

# 检查工作流文件
echo -e "\n${BLUE}🔧 检查工作流配置...${NC}"

if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅ 生产环境工作流已配置${NC}"
else
    echo -e "${RED}❌ 生产环境工作流缺失${NC}"
fi

if [ -f ".github/workflows/deploy-dev.yml" ]; then
    echo -e "${GREEN}✅ 开发环境工作流已配置${NC}"
else
    echo -e "${RED}❌ 开发环境工作流缺失${NC}"
fi

# 推送到两个分支以触发构建
echo -e "\n${BLUE}🚀 开始部署...${NC}"

# 推送到 main 分支
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}💡 切换到主分支...${NC}"
    git checkout main 2>/dev/null || git checkout master 2>/dev/null
fi

echo -e "${BLUE}📦 推送到生产分支...${NC}"
git push origin HEAD

# 推送到 dev 分支
echo -e "${BLUE}📦 推送到开发分支...${NC}"
git checkout dev
git merge main --no-edit 2>/dev/null || git merge master --no-edit 2>/dev/null
git push origin dev

# 显示设置说明
echo -e "\n${GREEN}🎉 部署已触发！${NC}"
echo -e "\n${BLUE}📋 接下来需要手动设置 GitHub Pages:${NC}"
echo -e "1. 打开 GitHub 仓库页面: ${YELLOW}https://github.com/${USERNAME}/${REPONAME}${NC}"
echo -e "2. 进入 ${YELLOW}Settings > Pages${NC}"
echo -e "3. 设置生产环境:"
echo -e "   - Source: ${YELLOW}GitHub Actions${NC}"
echo -e "4. 等待生产环境部署完成"
echo -e "5. 设置开发环境:"
echo -e "   - 添加新的 Pages 配置"
echo -e "   - Source: ${YELLOW}Deploy from a branch${NC}"
echo -e "   - Branch: ${YELLOW}gh-pages-dev${NC}"
echo -e "   - Folder: ${YELLOW}/ (root)${NC}"

echo -e "\n${BLUE}🔗 预期访问地址:${NC}"
echo -e "生产环境: ${GREEN}https://${USERNAME}.github.io/${REPONAME}/${NC}"
echo -e "开发环境: ${GREEN}同上地址，在 Pages 设置中切换分支${NC}"

echo -e "\n${BLUE}📊 查看部署状态:${NC}"
echo -e "GitHub Actions: ${YELLOW}https://github.com/${USERNAME}/${REPONAME}/actions${NC}"

echo -e "\n${BLUE}📚 详细文档:${NC}"
echo -e "查看 ${YELLOW}DEV_DEPLOYMENT_GUIDE.md${NC} 获取完整设置指南"

echo -e "\n${GREEN}✅ 设置脚本执行完成！${NC}"
echo -e "${YELLOW}💡 提示: 首次部署可能需要几分钟时间${NC}"
