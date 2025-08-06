#!/bin/bash

echo "🚀 启动可视化工作流编辑器..."
echo "=================================="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd client && npm install && cd ..
fi

# 停止任何现有的进程
echo "🛑 停止现有进程..."
pkill -f "server/index.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 2

# 启动后端服务器
echo "🔧 启动后端服务器 (端口 3001)..."
nohup node server/index.js > backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:3001/api/node-types > /dev/null; then
    echo "✅ 后端服务器启动成功"
else
    echo "❌ 后端服务器启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务器
echo "🎨 启动前端服务器 (端口 3000)..."
cd client
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端启动
echo "⏳ 等待前端启动 (大约30秒)..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ 前端服务器启动成功"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "🎉 应用启动完成！"
echo "=================================="
echo "📱 前端界面: http://localhost:3000"
echo "🔌 后端 API: http://localhost:3001"
echo ""
echo "📋 常用 API 端点:"
echo "  - GET  /api/workflows     - 获取工作流列表"
echo "  - POST /api/workflows     - 创建新工作流"
echo "  - GET  /api/node-types    - 获取节点类型"
echo ""
echo "📝 日志文件:"
echo "  - 后端日志: backend.log"
echo "  - 前端日志: frontend.log"
echo ""
echo "🛑 停止应用: ./stop.sh"
echo ""

# 保存 PID 到文件
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "✨ 请在浏览器中访问 http://localhost:3000 开始使用！"