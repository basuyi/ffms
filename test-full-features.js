#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

console.log('🧪 测试完整工作流编辑器功能...\n');

async function testCompleteWorkflow() {
  console.log('📋 创建包含多种节点类型的复杂工作流...');
  
  const complexWorkflow = {
    name: '完整功能测试工作流',
    description: '测试所有节点类型和功能的复杂工作流',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          type: 'start',
          description: '工作流启动'
        }
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 300, y: 200 },
        data: {
          label: '获取数据',
          type: 'api',
          description: '获取用户数据',
          url: 'https://jsonplaceholder.typicode.com/users/1',
          method: 'GET'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 500, y: 200 },
        data: {
          label: '检查数据',
          type: 'condition',
          description: '验证数据有效性',
          condition: 'data.id > 0'
        }
      },
      {
        id: 'task-success',
        type: 'task',
        position: { x: 700, y: 100 },
        data: {
          label: '处理成功',
          type: 'task',
          description: '处理有效数据',
          title: '数据处理任务',
          command: 'echo "Processing valid data"'
        }
      },
      {
        id: 'task-fail',
        type: 'task',
        position: { x: 700, y: 300 },
        data: {
          label: '处理失败',
          type: 'task',
          description: '处理无效数据',
          title: '错误处理任务',
          command: 'echo "Handling invalid data"'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 900, y: 200 },
        data: {
          label: '等待',
          type: 'delay',
          description: '等待处理完成',
          delay: 2000
        }
      },
      {
        id: 'merge-1',
        type: 'merge',
        position: { x: 1100, y: 200 },
        data: {
          label: '合并结果',
          type: 'merge',
          description: '合并处理结果'
        }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 1300, y: 200 },
        data: {
          label: '结束',
          type: 'end',
          description: '工作流结束'
        }
      }
    ],
    connections: [
      { source: 'start-1', target: 'api-1' },
      { source: 'api-1', target: 'condition-1' },
      { source: 'condition-1', target: 'task-success', sourceHandle: 'output-true' },
      { source: 'condition-1', target: 'task-fail', sourceHandle: 'output-false' },
      { source: 'task-success', target: 'delay-1' },
      { source: 'task-fail', target: 'delay-1' },
      { source: 'delay-1', target: 'merge-1' },
      { source: 'merge-1', target: 'end-1' }
    ]
  };

  try {
    // 1. 创建工作流
    const createResponse = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complexWorkflow)
    });

    if (!createResponse.ok) {
      throw new Error(`创建失败: ${createResponse.status}`);
    }

    const workflow = await createResponse.json();
    console.log(`✅ 工作流创建成功 (ID: ${workflow.id})`);
    console.log(`   📊 节点数量: ${workflow.nodes.length}`);
    console.log(`   🔗 连接数量: ${workflow.connections.length}`);

    // 2. 验证工作流数据
    const getResponse = await fetch(`${API_BASE}/workflows/${workflow.id}`);
    const savedWorkflow = await getResponse.json();
    
    if (savedWorkflow.nodes.length !== complexWorkflow.nodes.length) {
      throw new Error('节点数量不匹配');
    }
    
    console.log(`✅ 工作流数据验证通过`);

    // 3. 执行工作流
    console.log(`\n⚡ 执行工作流...`);
    const executeResponse = await fetch(`${API_BASE}/workflows/${workflow.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { test: true } })
    });

    if (!executeResponse.ok) {
      throw new Error(`执行失败: ${executeResponse.status}`);
    }

    const execution = await executeResponse.json();
    console.log(`✅ 工作流开始执行 (执行ID: ${execution.executionId})`);

    // 4. 监控执行状态
    let attempts = 0;
    while (attempts < 30) { // 最多等待30秒
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${API_BASE}/executions/${execution.executionId}`);
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        console.log(`   📊 状态: ${status.status}, 当前节点: ${status.currentNode || 'N/A'}`);
        
        if (status.status === 'completed') {
          console.log(`✅ 工作流执行完成!`);
          console.log(`   📋 结果数量: ${Object.keys(status.results || {}).length}`);
          break;
        } else if (status.status === 'failed') {
          console.log(`❌ 工作流执行失败: ${status.error}`);
          break;
        }
      }
      attempts++;
    }

    // 5. 测试工作流列表
    console.log(`\n📋 测试工作流管理...`);
    const listResponse = await fetch(`${API_BASE}/workflows`);
    const workflowList = await listResponse.json();
    console.log(`✅ 获取到 ${workflowList.length} 个工作流`);

    // 6. 清理测试数据
    const deleteResponse = await fetch(`${API_BASE}/workflows/${workflow.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log(`✅ 测试工作流已清理`);
    }

    return true;

  } catch (error) {
    console.error(`❌ 测试失败:`, error.message);
    return false;
  }
}

async function testNodeTypes() {
  console.log(`\n🔧 测试节点类型API...`);
  
  try {
    const response = await fetch(`${API_BASE}/node-types`);
    const nodeTypes = await response.json();
    
    const expectedTypes = ['start', 'end', 'task', 'condition', 'parallel', 'merge', 'delay', 'api'];
    const actualTypes = Object.keys(nodeTypes);
    
    for (const type of expectedTypes) {
      if (!actualTypes.includes(type)) {
        throw new Error(`缺少节点类型: ${type}`);
      }
    }
    
    console.log(`✅ 所有 ${actualTypes.length} 种节点类型都可用`);
    return true;
    
  } catch (error) {
    console.error(`❌ 节点类型测试失败:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 完整功能测试开始\n');
  console.log('=' .repeat(50));
  
  // 检查服务器连接
  try {
    await fetch(`${API_BASE}/node-types`);
  } catch (error) {
    console.error('❌ 无法连接到服务器，请确保后端正在运行');
    process.exit(1);
  }
  
  const results = [];
  
  // 运行所有测试
  results.push(await testNodeTypes());
  results.push(await testCompleteWorkflow());
  
  console.log('\n' + '=' .repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`🎉 所有测试通过! (${passed}/${total})`);
    console.log('✨ 完整的可视化工作流编辑器功能正常!');
    console.log('\n🌐 访问 http://localhost:3000 开始使用');
  } else {
    console.log(`⚠️  部分测试失败 (${passed}/${total})`);
    console.log('💡 请检查上面的错误信息');
  }
}

main().catch(console.error);