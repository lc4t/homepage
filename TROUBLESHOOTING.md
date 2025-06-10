# 个人导航站项目故障排除指南

## 常见问题解决

### 🔧 开发服务器问题

#### 1. 清除开发缓存
```bash
# 停止开发服务器 (Ctrl+C)
# 删除 .next 缓存
rm -rf .next
# 重新启动
npm run dev
```

#### 2. 图标 404 错误
如果遇到图标文件 404 错误：
- 检查 `public/config/site.yaml` 中的图标路径
- 推荐使用 emoji 图标：`icon: "🖥️"`
- 或留空使用自动获取的 favicon：`icon: ""`

#### 3. 端口占用
```bash
# 查看端口占用
lsof -i :3000
# 杀死进程
kill -9 <PID>
```

### 📝 配置文件问题

#### 1. YAML 语法错误
```bash
# 验证配置文件
npm run validate-config
```

#### 2. 图标配置建议
```yaml
# 推荐：使用 emoji
icon: "🖥️"

# 推荐：留空自动获取
icon: ""

# 不推荐：本地文件路径（可能404）
icon: "/icons/nas.png"
```

### 🌐 网络和服务问题

#### 1. 内网服务检测
- 确保服务运行在指定端口
- 检查防火墙设置
- 浏览器 CORS 策略可能限制检测

#### 2. 背景图片加载
- Unsplash 图片需要网络连接
- 可以设置为纯色背景：`type: "color", value: "#667eea"`

### 🔄 重置项目
如果问题持续，可以重置项目：
```bash
# 停止开发服务器
# 清除所有缓存
rm -rf .next node_modules out
npm install
npm run dev
```
