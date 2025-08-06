#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function createDemoWorkflow() {
  console.log('🚀 创建演示工作流...\n');

  const demoWorkflow = {
    name: '数据处理工作流',
    description: '一个包含数据获取、处理和通知的完整工作流示例',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          type: 'start',
          description: '工作流启动点'
        }
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 300, y: 200 },
        data: {
          label: '获取数据',
          type: 'api',
          description: '从API获取用户数据',
          url: 'https://jsonplaceholder.typicode.com/users',
          method: 'GET',
          headers: '{"Content-Type": "application/json"}'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 500, y: 200 },
        data: {
          label: '数据验证',
          type: 'condition',
          description: '检查数据是否有效',
          condition: 'data.length > 0',
          operator: 'greater_than',
          value: '0'
        }
      },
      {
        id: 'task-1',
        type: 'task',
        position: { x: 700, y: 100 },
        data: {
          label: '处理数据',
          type: 'task',
          description: '处理获取到的数据',
          title: '数据转换任务',
          command: 'node data-processor.js'
        }
      },
      {
        id: 'api-2',
        type: 'api',
        position: { x: 900, y: 100 },
        data: {
          label: '发送通知',
          type: 'api',
          description: '发送处理完成通知',
          url: 'https://httpbin.org/post',
          method: 'POST',
          headers: '{"Content-Type": "application/json"}',
          body: '{"message": "数据处理完成", "status": "success"}'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 700, y: 300 },
        data: {
          label: '重试延时',
          type: 'delay',
          description: '等待后重试',
          delay: 5000
        }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 1100, y: 200 },
        data: {
          label: '结束',
          type: 'end',
          description: '工作流结束点'
        }
      }
    ],
    connections: [
      {
        source: 'start-1',
        target: 'api-1'
      },
      {
        source: 'api-1',
        target: 'condition-1'
      },
      {
        source: 'condition-1',
        target: 'task-1',
        sourceHandle: 'output-true',
        targetHandle: 'input'
      },
      {
        source: 'condition-1',
        target: 'delay-1',
        sourceHandle: 'output-false',
        targetHandle: 'input'
      },
      {
        source: 'task-1',
        target: 'api-2'
      },
      {
        source: 'api-2',
        target: 'end-1'
      },
      {
        source: 'delay-1',
        target: 'api-1'
      }
    ]
  };

  try {
    const response = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(demoWorkflow),
    });

    if (response.ok) {
      const createdWorkflow = await response.json();
      console.log('✅ 演示工作流创建成功!');
      console.log(`📝 工作流名称: ${createdWorkflow.name}`);
      console.log(`🆔 工作流 ID: ${createdWorkflow.id}`);
      console.log(`📊 节点数量: ${createdWorkflow.nodes.length}`);
      console.log(`🔗 连接数量: ${createdWorkflow.connections.length}`);
      
      return createdWorkflow;
    } else {
      console.error('❌ 创建工作流失败:', response.statusText);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

async function listWorkflows() {
  console.log('\n📋 获取所有工作流...\n');
  
  try {
    const response = await fetch(`${API_BASE}/workflows`);
    if (response.ok) {
      const workflows = await response.json();
      
      if (workflows.length === 0) {
        console.log('📭 暂无工作流');
        return;
      }
      
      console.log(`📚 找到 ${workflows.length} 个工作流:\n`);
      
      workflows.forEach((workflow, index) => {
        console.log(`${index + 1}. ${workflow.name}`);
        console.log(`   🆔 ID: ${workflow.id}`);
        console.log(`   📄 描述: ${workflow.description || '无描述'}`);
        console.log(`   📊 节点: ${workflow.nodes.length} 个`);
        console.log(`   🔗 连接: ${workflow.connections.length} 个`);
        console.log(`   📅 创建时间: ${new Date(workflow.createdAt).toLocaleString('zh-CN')}`);
        console.log('');
      });
      
      return workflows;
    } else {
      console.error('❌ 获取工作流失败:', response.statusText);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

async function executeWorkflow(workflowId) {
  console.log(`\n⚡ 执行工作流 ${workflowId}...\n`);
  
  try {
    const response = await fetch(`${API_BASE}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          message: '演示执行',
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 工作流开始执行!');
      console.log(`🆔 执行 ID: ${result.executionId}`);
      console.log(`📊 状态: ${result.status}`);
      
      return result;
    } else {
      console.error('❌ 执行工作流失败:', response.statusText);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

async function getNodeTypes() {
  console.log('\n🔧 获取支持的节点类型...\n');
  
  try {
    const response = await fetch(`${API_BASE}/node-types`);
    if (response.ok) {
      const nodeTypes = await response.json();
      
      console.log('📋 支持的节点类型:\n');
      
      Object.entries(nodeTypes).forEach(([type, config]) => {
        console.log(`🔸 ${type} - ${config.name}`);
        console.log(`   📥 输入: ${config.inputs} 个`);
        console.log(`   📤 输出: ${config.outputs} 个`);
        console.log('');
      });
      
      return nodeTypes;
    } else {
      console.error('❌ 获取节点类型失败:', response.statusText);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

async function main() {
  console.log('🎯 可视化工作流编辑器 - API 演示\n');
  console.log('=' .repeat(50));
  
  // 获取节点类型
  await getNodeTypes();
  
  // 创建演示工作流
  const workflow = await createDemoWorkflow();
  
  // 列出所有工作流
  await listWorkflows();
  
  // 如果创建成功，执行工作流
  if (workflow) {
    await executeWorkflow(workflow.id);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🌐 访问 http://localhost:3000 查看可视化界面');
  console.log('📚 查看 README.md 了解更多使用方法');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/node-types`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 运行演示
checkServer().then(isRunning => {
  if (isRunning) {
    main().catch(console.error);
  } else {
    console.error('❌ 服务器未运行，请先运行 "npm run dev" 启动应用');
    process.exit(1);
  }
});

module.exports = {
  createDemoWorkflow,
  listWorkflows,
  executeWorkflow,
  getNodeTypes
};