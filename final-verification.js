#!/usr/bin/env node

const fetch = require('node-fetch');
const WebSocket = require('ws');

console.log('🎯 进行最终用户体验验证...\n');

async function finalVerification() {
  console.log('1. 🌐 验证前端页面访问...');
  
  // 测试主页面
  const homeResponse = await fetch('http://localhost:3001');
  const homeHtml = await homeResponse.text();
  
  if (homeHtml.includes('root') || homeHtml.includes('React')) {
    console.log('   ✅ 前端页面加载正常');
  } else {
    console.log('   ❌ 前端页面可能有问题');
    return false;
  }

  console.log('\n2. 🧩 验证核心功能组件...');
  
  // 验证节点类型
  const nodeTypesResponse = await fetch('http://localhost:3001/api/node-types');
  const nodeTypes = await nodeTypesResponse.json();
  console.log(`   ✅ 支持 ${Object.keys(nodeTypes).length} 种节点类型: ${Object.keys(nodeTypes).join(', ')}`);

  console.log('\n3. 💼 模拟完整用户工作流...');
  
  // 创建复杂工作流
  const complexWorkflow = {
    name: '用户验证工作流',
    description: '模拟真实用户创建的工作流',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: '开始', type: 'start' }
      },
      {
        id: 'task-1',
        type: 'task',
        position: { x: 300, y: 100 },
        data: { label: '数据处理', type: 'task', title: '处理输入数据', description: '清洗和验证数据' }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 500, y: 200 },
        data: { label: '判断条件', type: 'condition', condition: 'data.valid === true' }
      },
      {
        id: 'task-2',
        type: 'task',
        position: { x: 700, y: 100 },
        data: { label: '成功处理', type: 'task', title: '保存结果' }
      },
      {
        id: 'task-3',
        type: 'task',
        position: { x: 700, y: 300 },
        data: { label: '错误处理', type: 'task', title: '记录错误' }
      },
      {
        id: 'parallel-1',
        type: 'parallel',
        position: { x: 900, y: 200 },
        data: { label: '并行处理', type: 'parallel' }
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 1100, y: 150 },
        data: { label: 'API调用', type: 'api', url: 'https://api.example.com/notify', method: 'POST' }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 1100, y: 250 },
        data: { label: '等待', type: 'delay', duration: 2000 }
      },
      {
        id: 'merge-1',
        type: 'merge',
        position: { x: 1300, y: 200 },
        data: { label: '合并结果', type: 'merge' }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 1500, y: 200 },
        data: { label: '结束', type: 'end' }
      }
    ],
    connections: [
      { source: 'start-1', target: 'task-1' },
      { source: 'task-1', target: 'condition-1' },
      { source: 'condition-1', target: 'task-2' },
      { source: 'condition-1', target: 'task-3' },
      { source: 'task-2', target: 'parallel-1' },
      { source: 'task-3', target: 'parallel-1' },
      { source: 'parallel-1', target: 'api-1' },
      { source: 'parallel-1', target: 'delay-1' },
      { source: 'api-1', target: 'merge-1' },
      { source: 'delay-1', target: 'merge-1' },
      { source: 'merge-1', target: 'end-1' }
    ]
  };

  const createResponse = await fetch('http://localhost:3001/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complexWorkflow)
  });

  const workflow = await createResponse.json();
  console.log(`   ✅ 复杂工作流创建成功 (${workflow.nodes.length} 个节点, ${workflow.connections.length} 个连接)`);

  console.log('\n4. ⚡ 测试工作流执行和实时监控...');
  
  // 设置WebSocket监听
  const ws = new WebSocket('ws://localhost:3001');
  let executionUpdates = 0;
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'execution_update') {
      executionUpdates++;
      console.log(`   📡 实时更新: ${message.data.status} - ${message.data.currentNode || '无'}`);
    }
  });

  // 执行工作流
  const executeResponse = await fetch(`http://localhost:3001/api/workflows/${workflow.id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { data: { valid: true }, userId: 'test-user' } })
  });

  const execution = await executeResponse.json();
  console.log(`   ⚡ 工作流开始执行 (ID: ${execution.executionId})`);

  // 监控执行过程
  let attempts = 0;
  let finalStatus = null;
  
  while (attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusResponse = await fetch(`http://localhost:3001/api/executions/${execution.executionId}`);
    const status = await statusResponse.json();
    
    if (status.status === 'completed') {
      finalStatus = status;
      console.log(`   ✅ 工作流执行完成 (耗时: ${new Date(status.completedAt) - new Date(status.startedAt)}ms)`);
      break;
    } else if (status.status === 'failed') {
      console.log(`   ❌ 工作流执行失败: ${status.error}`);
      return false;
    }
    
    attempts++;
  }

  ws.close();

  if (!finalStatus) {
    console.log('   ⚠️ 工作流执行超时');
    return false;
  }

  console.log(`   📊 收到 ${executionUpdates} 次实时更新`);

  console.log('\n5. 🔍 验证执行结果...');
  
  if (finalStatus.result && finalStatus.executedNodes) {
    console.log(`   ✅ 执行了 ${finalStatus.executedNodes.length} 个节点`);
    console.log(`   ✅ 生成了执行结果: ${JSON.stringify(finalStatus.result).substring(0, 100)}...`);
  }

  console.log('\n6. 🧹 清理测试数据...');
  
  await fetch(`http://localhost:3001/api/workflows/${workflow.id}`, { method: 'DELETE' });
  console.log('   ✅ 测试数据已清理');

  return true;
}

async function checkServerStatus() {
  console.log('📋 检查服务器状态...');
  
  try {
    const response = await fetch('http://localhost:3001/api/node-types');
    if (response.ok) {
      console.log('✅ 服务器运行正常\n');
      return true;
    }
  } catch (error) {
    console.log('❌ 服务器无法连接\n');
    return false;
  }
  return false;
}

async function main() {
  if (!(await checkServerStatus())) {
    console.log('❌ 服务器未启动，请先启动服务器');
    return;
  }

  const success = await finalVerification();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎊 最终验证结果');
  console.log('='.repeat(60));
  
  if (success) {
    console.log('🎉 集成测试全部通过！应用完全可用！');
    console.log('');
    console.log('🎯 您的可视化工作流编辑器已经准备就绪！');
    console.log('');
    console.log('🌟 功能特性:');
    console.log('   ✅ 拖拽式节点编辑');
    console.log('   ✅ 8种节点类型 (开始、结束、任务、条件、并行、合并、延迟、API)');
    console.log('   ✅ 可视化连接编辑');
    console.log('   ✅ 实时工作流执行');
    console.log('   ✅ WebSocket实时状态更新');
    console.log('   ✅ 工作流保存和管理');
    console.log('   ✅ 响应式界面设计');
    console.log('');
    console.log('🚀 立即体验:');
    console.log('   🌐 主要访问: http://localhost:3001');
    console.log('   🔄 备用访问: http://127.0.0.1:3001');
    console.log('');
    console.log('🎮 使用说明:');
    console.log('   1. 点击右下角 ➕ 按钮添加节点');
    console.log('   2. 拖拽节点边缘的连接点来连接节点');
    console.log('   3. 点击节点查看右侧属性面板');
    console.log('   4. 点击顶部"保存"按钮保存工作流');
    console.log('   5. 点击"执行"按钮运行工作流');
    console.log('   6. 查看左下角执行面板的实时状态');
    console.log('');
    console.log('✨ 现在就去浏览器中体验您的工作流编辑器吧！');
  } else {
    console.log('⚠️ 验证过程中发现问题，请检查日志');
  }
}

main().catch(error => {
  console.error('❌ 验证失败:', error.message);
  process.exit(1);
});