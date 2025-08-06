#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:9000/api';

console.log('🧪 测试新端口的工作流功能...\n');

async function quickTest() {
  try {
    // 1. 测试节点类型API
    console.log('📋 测试节点类型API...');
    const nodeTypesResponse = await fetch(`${API_BASE}/node-types`);
    const nodeTypes = await nodeTypesResponse.json();
    console.log(`✅ 获取到 ${Object.keys(nodeTypes).length} 种节点类型`);

    // 2. 创建简单工作流
    console.log('\n🔧 创建测试工作流...');
    const testWorkflow = {
      name: '端口测试工作流',
      description: '测试新端口功能',
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: '开始', type: 'start' }
        },
        {
          id: 'task-1',
          type: 'task',
          position: { x: 300, y: 100 },
          data: { label: '任务', type: 'task', title: '测试任务' }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 500, y: 100 },
          data: { label: '结束', type: 'end' }
        }
      ],
      connections: [
        { source: 'start-1', target: 'task-1' },
        { source: 'task-1', target: 'end-1' }
      ]
    };

    const createResponse = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testWorkflow)
    });

    const workflow = await createResponse.json();
    console.log(`✅ 工作流创建成功 (ID: ${workflow.id})`);

    // 3. 执行工作流
    console.log('\n⚡ 执行工作流...');
    const executeResponse = await fetch(`${API_BASE}/workflows/${workflow.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: {} })
    });

    const execution = await executeResponse.json();
    console.log(`✅ 工作流开始执行 (执行ID: ${execution.executionId})`);

    // 4. 等待执行完成
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${API_BASE}/executions/${execution.executionId}`);
      const status = await statusResponse.json();
      
      if (status.status === 'completed') {
        console.log('✅ 工作流执行完成!');
        break;
      } else if (status.status === 'failed') {
        console.log('❌ 工作流执行失败');
        break;
      }
      attempts++;
    }

    // 5. 清理
    await fetch(`${API_BASE}/workflows/${workflow.id}`, { method: 'DELETE' });
    console.log('✅ 测试数据已清理');

    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}

async function main() {
  const success = await quickTest();
  
  console.log('\n' + '='.repeat(50));
  
  if (success) {
    console.log('🎉 新端口功能测试成功!');
    console.log('');
    console.log('📱 访问地址:');
    console.log('   🎨 前端界面: http://localhost:8000');
    console.log('   🔌 后端 API: http://localhost:9000');
    console.log('');
    console.log('✨ 现在您可以在浏览器中访问新端口了！');
  } else {
    console.log('⚠️  新端口测试失败，请检查服务状态');
  }
}

main().catch(console.error);