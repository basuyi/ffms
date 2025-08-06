# 🔧 工作流编辑器访问故障排除指南

## 🎯 问题描述
无法访问 http://localhost:3000

## 📋 快速检查清单

### 1. 检查服务状态
```bash
./check-status.sh
```

### 2. 检查端口连接
```bash
curl http://localhost:3000
curl http://localhost:3001/api/node-types
```

### 3. 检查进程运行状态
```bash
ps aux | grep -E "(react-scripts|server/index.js)" | grep -v grep
```

## 🛠️ 解决方案

### 方案1: 重启服务
```bash
./stop.sh
./start.sh
```

### 方案2: 使用不同的地址
尝试以下地址：
- http://127.0.0.1:3000
- http://0.0.0.0:3000
- http://[你的IP]:3000

### 方案3: 手动启动前端
```bash
cd client
BROWSER=none HOST=0.0.0.0 PORT=3000 npm start
```

### 方案4: 使用测试页面
访问: http://localhost:8080/test-access.html

### 方案5: 检查防火墙设置
确保端口3000和3001没有被阻挡：
```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload
```

### 方案6: 清除浏览器缓存
- 按 `Ctrl+F5` (Windows/Linux) 或 `Cmd+Shift+R` (Mac)
- 或打开开发者工具，右键刷新按钮选择"清空缓存并硬性重新加载"

### 方案7: 构建生产版本
```bash
cd client
npm run build
cd ..
# 修改server/index.js取消静态文件服务的注释
node server/index.js
# 然后访问 http://localhost:3001
```

## 🔍 诊断命令

### 检查端口占用
```bash
# Linux
ss -tlnp | grep :3000
lsof -i :3000

# 查看网络接口
ip addr show
```

### 检查服务日志
```bash
tail -f backend.log
tail -f frontend.log
```

### 测试网络连通性
```bash
# 本地测试
telnet localhost 3000

# 远程测试（如果是远程服务器）
curl -I http://[服务器IP]:3000
```

## 🌐 网络配置问题

### 如果在云服务器/VPS上运行：
1. **检查安全组/防火墙规则**
   - 确保入站规则允许端口3000和3001
   
2. **检查服务器监听地址**
   ```bash
   netstat -tlnp | grep :3000
   ```
   
3. **使用公网IP访问**
   ```
   http://[你的公网IP]:3000
   ```

### 如果在Docker容器中运行：
```bash
# 映射端口
docker run -p 3000:3000 -p 3001:3001 [容器名]
```

### 如果在虚拟机中运行：
确保端口转发设置正确

## 📱 浏览器相关问题

### 尝试不同浏览器
- Chrome
- Firefox  
- Safari
- Edge

### 检查浏览器控制台
1. 打开开发者工具 (F12)
2. 查看Console标签页的错误信息
3. 查看Network标签页的网络请求

### 禁用浏览器扩展
某些广告拦截器或安全扩展可能阻挡本地服务

## 💡 临时解决方案

### 使用后端提供的静态文件
1. 修改 `server/index.js`，取消静态文件服务的注释
2. 构建前端: `cd client && npm run build`
3. 访问: http://localhost:3001

### 使用端口代理
```bash
# 使用nginx或其他代理
# 或者使用Node.js的proxy
npm install -g http-proxy-cli
http-proxy -p 8080 --target http://localhost:3000
# 然后访问 http://localhost:8080
```

## 📞 获取帮助

如果以上方法都无效，请提供以下信息：

1. **操作系统信息**
   ```bash
   uname -a
   cat /etc/os-release
   ```

2. **Node.js版本**
   ```bash
   node --version
   npm --version
   ```

3. **网络信息**
   ```bash
   ifconfig
   netstat -tlnp | grep -E ":(3000|3001)"
   ```

4. **错误日志**
   ```bash
   tail -50 backend.log
   tail -50 frontend.log
   ```

5. **浏览器控制台错误截图**

## 🎯 常见问题及解决方案

| 问题 | 解决方案 |
|------|----------|
| 连接被拒绝 | 检查服务是否启动，防火墙设置 |
| 页面空白 | 清除缓存，检查JavaScript控制台错误 |
| 加载缓慢 | 检查网络连接，服务器性能 |
| API无法访问 | 检查代理配置，后端服务状态 |
| 端口被占用 | 杀死占用进程或使用其他端口 |

---

💡 **提示**: 大多数访问问题都可以通过重启服务解决。如果问题持续存在，建议逐步排查网络、防火墙和浏览器设置。