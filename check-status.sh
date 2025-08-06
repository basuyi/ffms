#!/bin/bash

echo "🔍 检查可视化工作流编辑器状态..."
echo "========================================="

# 检查后端
echo "1. 检查后端服务器..."
if curl -s http://localhost:3001/api/node-types > /dev/null 2>&1; then
    echo "   ✅ 后端服务器运行正常 (端口 3001)"
else
    echo "   ❌ 后端服务器无法连接"
    echo "   💡 尝试运行: node server/index.js"
    exit 1
fi

# 检查前端
echo "2. 检查前端服务器..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ 前端服务器运行正常 (端口 3000)"
else
    echo "   ❌ 前端服务器无法连接"
    echo "   💡 尝试运行: cd client && npm start"
    exit 1
fi

# 检查代理
echo "3. 检查API代理..."
if curl -s http://localhost:3000/api/node-types > /dev/null 2>&1; then
    echo "   ✅ API代理工作正常"
else
    echo "   ⚠️  API代理可能有问题"
    echo "   💡 检查 package.json 中的 proxy 配置"
fi

# 检查进程
echo "4. 检查运行进程..."
BACKEND_PID=$(ps aux | grep "server/index.js" | grep -v grep | awk '{print $2}')
FRONTEND_PID=$(ps aux | grep "react-scripts" | grep -v grep | awk '{print $2}')

if [ ! -z "$BACKEND_PID" ]; then
    echo "   ✅ 后端进程运行中 (PID: $BACKEND_PID)"
else
    echo "   ❌ 找不到后端进程"
fi

if [ ! -z "$FRONTEND_PID" ]; then
    echo "   ✅ 前端进程运行中 (PID: $FRONTEND_PID)"
else
    echo "   ❌ 找不到前端进程"
fi

# 检查内容
echo "5. 检查页面内容..."
CONTENT=$(curl -s http://localhost:3000 2>/dev/null)
if echo "$CONTENT" | grep -q "React App"; then
    echo "   ✅ 前端页面正常加载"
else
    echo "   ❌ 前端页面内容异常"
fi

if echo "$CONTENT" | grep -q "bundle.js"; then
    echo "   ✅ JavaScript包已引用"
else
    echo "   ❌ JavaScript包未找到"
fi

# 检查JavaScript包
echo "6. 检查JavaScript包..."
if curl -I http://localhost:3000/static/js/bundle.js 2>/dev/null | grep -q "200 OK"; then
    echo "   ✅ JavaScript包可访问"
else
    echo "   ❌ JavaScript包无法访问"
fi

echo ""
echo "📱 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo ""

# 最终状态
BACKEND_OK=$(curl -s http://localhost:3001/api/node-types > /dev/null 2>&1 && echo "1" || echo "0")
FRONTEND_OK=$(curl -s http://localhost:3000 > /dev/null 2>&1 && echo "1" || echo "0")

if [ "$BACKEND_OK" = "1" ] && [ "$FRONTEND_OK" = "1" ]; then
    echo "🎉 系统状态: 正常运行"
    echo "✨ 您现在可以在浏览器中访问应用了！"
else
    echo "⚠️  系统状态: 部分异常"
    echo "💡 请检查上面的错误信息并修复"
fi