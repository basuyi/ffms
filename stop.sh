#!/bin/bash

echo "🛑 停止可视化工作流编辑器..."
echo "=================================="

# 停止后端服务器
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🔧 停止后端服务器 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm -f .backend.pid
fi

# 停止前端服务器
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🎨 停止前端服务器 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm -f .frontend.pid
fi

# 确保所有相关进程都被停止
echo "🧹 清理剩余进程..."
pkill -f "server/index.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

echo "✅ 所有服务已停止"

# 清理日志文件（可选）
read -p "是否删除日志文件? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f backend.log frontend.log
    echo "🗑️ 日志文件已删除"
fi

echo "👋 再见！"