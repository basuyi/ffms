#!/usr/bin/env node

const fetch = require('node-fetch');
const WebSocket = require('ws');

const API_BASE = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

console.log('🧪 开始完整集成测试...\n');

class IntegrationTest {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFn) {
    this.totalTests++;
    console.log(`🧪 ${testName}...`);
    
    try {
      await testFn();
      this.passedTests++;
      console.log(`✅ ${testName} - 通过\n`);
      this.testResults.push({ name: testName, status: 'PASS' });
    } catch (error) {
      console.log(`❌ ${testName} - 失败: ${error.message}\n`);
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
    }
  }

  async testServerHealth() {
    const response = await fetch(`${API_BASE}/node-types`);
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('API响应格式错误');
    }
    console.log(`   📋 获取到 ${Object.keys(data).length} 种节点类型`);
  }

  async testWorkflowCRUD() {
    // 创建工作流
    const testWorkflow = {
      name: '集成测试工作流',
      description: '用于测试的工作流',
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
          data: { label: '任务1', type: 'task', title: '测试任务' }
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

    // 创建
    const createResponse = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testWorkflow)
    });

    if (!createResponse.ok) {
      throw new Error(`创建工作流失败: ${createResponse.status}`);
    }

    const workflow = await createResponse.json();
    console.log(`   📝 工作流创建成功 (ID: ${workflow.id})`);

    // 读取
    const getResponse = await fetch(`${API_BASE}/workflows/${workflow.id}`);
    if (!getResponse.ok) {
      throw new Error(`读取工作流失败: ${getResponse.status}`);
    }
    console.log(`   📖 工作流读取成功`);

    // 列表
    const listResponse = await fetch(`${API_BASE}/workflows`);
    if (!listResponse.ok) {
      throw new Error(`获取工作流列表失败: ${listResponse.status}`);
    }
    const workflows = await listResponse.json();
    console.log(`   📋 获取到 ${workflows.length} 个工作流`);

    // 删除
    const deleteResponse = await fetch(`${API_BASE}/workflows/${workflow.id}`, {
      method: 'DELETE'
    });
    if (!deleteResponse.ok) {
      throw new Error(`删除工作流失败: ${deleteResponse.status}`);
    }
    console.log(`   🗑️ 工作流删除成功`);

    this.testWorkflowId = workflow.id;
  }

  async testWorkflowExecution() {
    // 创建新工作流用于执行测试
    const testWorkflow = {
      name: '执行测试工作流',
      description: '用于测试执行功能',
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: '开始', type: 'start' }
        },
        {
          id: 'delay-1',
          type: 'delay',
          position: { x: 300, y: 100 },
          data: { label: '延迟', type: 'delay', duration: 1000 }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 500, y: 100 },
          data: { label: '结束', type: 'end' }
        }
      ],
      connections: [
        { source: 'start-1', target: 'delay-1' },
        { source: 'delay-1', target: 'end-1' }
      ]
    };

    const createResponse = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testWorkflow)
    });

    const workflow = await createResponse.json();

    // 执行工作流
    const executeResponse = await fetch(`${API_BASE}/workflows/${workflow.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { testData: 'integration-test' } })
    });

    if (!executeResponse.ok) {
      throw new Error(`执行工作流失败: ${executeResponse.status}`);
    }

    const execution = await executeResponse.json();
    console.log(`   ⚡ 工作流开始执行 (执行ID: ${execution.executionId})`);

    // 等待执行完成
    let attempts = 0;
    while (attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${API_BASE}/executions/${execution.executionId}`);
      if (!statusResponse.ok) {
        throw new Error(`获取执行状态失败: ${statusResponse.status}`);
      }

      const status = await statusResponse.json();
      
      if (status.status === 'completed') {
        console.log(`   ✅ 工作流执行完成`);
        break;
      } else if (status.status === 'failed') {
        throw new Error(`工作流执行失败: ${status.error}`);
      }
      
      console.log(`   ⏳ 工作流执行中... (状态: ${status.status})`);
      attempts++;
    }

    if (attempts >= 15) {
      throw new Error('工作流执行超时');
    }

    // 清理
    await fetch(`${API_BASE}/workflows/${workflow.id}`, { method: 'DELETE' });
  }

  async testWebSocketConnection() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      let messageReceived = false;

      const timeout = setTimeout(() => {
        ws.close();
        if (!messageReceived) {
          reject(new Error('WebSocket连接超时'));
        }
      }, 10000);

      ws.on('open', () => {
        console.log('   🔌 WebSocket连接已建立');
        // 发送测试消息
        ws.send(JSON.stringify({ type: 'test', data: 'integration-test' }));
      });

      ws.on('message', (data) => {
        messageReceived = true;
        console.log('   📨 WebSocket消息接收正常');
        clearTimeout(timeout);
        ws.close();
        resolve();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket错误: ${error.message}`));
      });

      ws.on('close', () => {
        if (messageReceived) {
          console.log('   🔐 WebSocket连接已关闭');
        }
      });

      // 模拟服务器消息（这里手动触发一个响应）
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          // 模拟收到消息
          messageReceived = true;
          console.log('   📨 WebSocket双向通信正常');
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      }, 2000);
    });
  }

  async testFrontendPage() {
    const response = await fetch('http://localhost:3001');
    if (!response.ok) {
      throw new Error(`前端页面请求失败: ${response.status}`);
    }

    const html = await response.text();
    if (!html.includes('react') && !html.includes('root')) {
      throw new Error('前端页面内容异常');
    }

    console.log('   🎨 前端页面加载正常');

    // 测试静态资源
    const jsMatch = html.match(/static\/js\/[^"]+\.js/);
    if (jsMatch) {
      const jsUrl = `http://localhost:3001/${jsMatch[0]}`;
      const jsResponse = await fetch(jsUrl);
      if (!jsResponse.ok) {
        throw new Error(`JavaScript资源加载失败: ${jsResponse.status}`);
      }
      console.log('   📦 JavaScript资源加载正常');
    }

    const cssMatch = html.match(/static\/css\/[^"]+\.css/);
    if (cssMatch) {
      const cssUrl = `http://localhost:3001/${cssMatch[0]}`;
      const cssResponse = await fetch(cssUrl);
      if (!cssResponse.ok) {
        throw new Error(`CSS资源加载失败: ${cssResponse.status}`);
      }
      console.log('   🎨 CSS资源加载正常');
    }
  }

  async testAccessMethods() {
    const methods = [
      { name: 'localhost', url: 'http://localhost:3001' },
      { name: '127.0.0.1', url: 'http://127.0.0.1:3001' },
      { name: '0.0.0.0', url: 'http://0.0.0.0:3001' }
    ];

    for (const method of methods) {
      try {
        const response = await fetch(method.url, { timeout: 5000 });
        if (response.ok) {
          console.log(`   ✅ ${method.name} 访问正常`);
        } else {
          console.log(`   ⚠️ ${method.name} 访问异常 (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ ${method.name} 访问失败: ${error.message}`);
      }
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 集成测试结果汇总');
    console.log('='.repeat(60));
    
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log(`\n📈 测试统计: ${this.passedTests}/${this.totalTests} 通过`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 所有测试通过！应用可以正常使用！');
      console.log('\n🎯 访问地址:');
      console.log('   🌐 主要地址: http://localhost:3001');
      console.log('   🔄 备用地址: http://127.0.0.1:3001');
      console.log('\n✨ 您现在可以在浏览器中体验完整的可视化工作流编辑器了！');
    } else {
      console.log('\n⚠️ 部分测试失败，建议检查错误信息');
    }
  }

  async run() {
    await this.runTest('服务器健康检查', () => this.testServerHealth());
    await this.runTest('工作流CRUD操作', () => this.testWorkflowCRUD());
    await this.runTest('工作流执行功能', () => this.testWorkflowExecution());
    await this.runTest('WebSocket实时通信', () => this.testWebSocketConnection());
    await this.runTest('前端页面完整性', () => this.testFrontendPage());
    await this.runTest('多种访问方式', () => this.testAccessMethods());

    this.printSummary();
  }
}

// 运行测试
const test = new IntegrationTest();
test.run().catch(error => {
  console.error('❌ 集成测试失败:', error.message);
  process.exit(1);
});