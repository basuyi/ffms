#!/bin/bash

echo "🔍 检查新端口上的工作流编辑器状态..."
echo "========================================="

# 检查后端 (端口 9000)
echo "1. 检查后端服务器 (端口 9000)..."
if curl -s http://localhost:9000/api/node-types > /dev/null 2>&1; then
    echo "   ✅ 后端服务器运行正常"
else
    echo "   ❌ 后端服务器无法连接"
    exit 1
fi

# 检查前端 (端口 8000)
echo "2. 检查前端服务器 (端口 8000)..."
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "   ✅ 前端服务器运行正常"
else
    echo "   ❌ 前端服务器无法连接"
    exit 1
fi

# 检查API代理
echo "3. 检查API代理..."
if curl -s http://localhost:8000/api/node-types > /dev/null 2>&1; then
    echo "   ✅ API代理工作正常"
else
    echo "   ⚠️  API代理可能有问题"
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

echo ""
echo "📱 新的访问地址:"
echo "   🎨 前端界面: http://localhost:8000"
echo "   🔌 后端 API: http://localhost:9000"
echo "   🎯 生产版本: http://localhost:9000 (如果构建了)"
echo ""

# 测试API功能
echo "5. 测试API功能..."
NODE_TYPES=$(curl -s http://localhost:9000/api/node-types 2>/dev/null)
if echo "$NODE_TYPES" | grep -q "start"; then
    echo "   ✅ 节点类型API正常"
else
    echo "   ❌ 节点类型API异常"
fi

echo ""
echo "🎉 端口更换完成！"
echo "✨ 请在浏览器中访问 http://localhost:8000 开始使用！"
echo ""
echo "🔄 如果需要切换回原端口，运行: ./start.sh"