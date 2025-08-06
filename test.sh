#!/bin/bash

echo "🧪 测试可视化工作流编辑器..."
echo "=================================="

# 测试后端 API
echo "🔧 测试后端 API..."
if curl -s http://localhost:3001/api/node-types > /dev/null; then
    echo "✅ 后端 API 正常"
else
    echo "❌ 后端 API 无法访问"
    echo "💡 请运行 './start.sh' 启动应用"
    exit 1
fi

# 测试前端
echo "🎨 测试前端服务..."
if curl -s http://localhost:3000 | grep -q "React App"; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务无法访问"
    echo "💡 请等待前端完全启动或运行 './start.sh'"
    exit 1
fi

# 测试 API 功能
echo "📋 测试 API 功能..."

# 测试获取节点类型
NODE_TYPES=$(curl -s http://localhost:3001/api/node-types)
if echo "$NODE_TYPES" | grep -q "start"; then
    echo "✅ 节点类型 API 正常"
else
    echo "❌ 节点类型 API 异常"
    exit 1
fi

# 测试创建工作流
CREATE_RESULT=$(curl -s -X POST http://localhost:3001/api/workflows \
    -H "Content-Type: application/json" \
    -d '{"name":"测试工作流","description":"自动化测试","nodes":[],"connections":[]}')

if echo "$CREATE_RESULT" | grep -q "id"; then
    echo "✅ 工作流创建 API 正常"
    
    # 提取工作流 ID
    WORKFLOW_ID=$(echo "$CREATE_RESULT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    # 测试获取工作流列表
    if curl -s http://localhost:3001/api/workflows | grep -q "$WORKFLOW_ID"; then
        echo "✅ 工作流列表 API 正常"
    else
        echo "❌ 工作流列表 API 异常"
    fi
    
    # 清理测试数据
    curl -s -X DELETE http://localhost:3001/api/workflows/$WORKFLOW_ID > /dev/null
    
else
    echo "❌ 工作流创建 API 异常"
    exit 1
fi

echo ""
echo "🎉 所有测试通过！"
echo "=================================="
echo "📱 前端界面: http://localhost:3000"
echo "🔌 后端 API: http://localhost:3001"
echo ""
echo "✨ 应用运行正常，可以开始使用了！"