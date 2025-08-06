const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 中间件
app.use(cors());
app.use(bodyParser.json());
// 静态文件服务（生产模式）
app.use(express.static(path.join(__dirname, '../client/build')));

// 内存存储（生产环境应使用数据库）
let workflows = new Map();
let workflowExecutions = new Map();

// WebSocket 连接管理
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('WebSocket 客户端已连接');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket 客户端已断开');
  });
});

// 广播消息给所有客户端
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 工作流节点类型定义
const nodeTypes = {
  start: { name: '开始', inputs: 0, outputs: 1 },
  end: { name: '结束', inputs: 1, outputs: 0 },
  task: { name: '任务', inputs: 1, outputs: 1 },
  condition: { name: '条件判断', inputs: 1, outputs: 2 },
  parallel: { name: '并行处理', inputs: 1, outputs: 2 },
  merge: { name: '合并', inputs: 2, outputs: 1 },
  delay: { name: '延时', inputs: 1, outputs: 1 },
  api: { name: 'API调用', inputs: 1, outputs: 1 }
};

// API 路由

// 获取所有工作流
app.get('/api/workflows', (req, res) => {
  const workflowList = Array.from(workflows.values());
  res.json(workflowList);
});

// 获取特定工作流
app.get('/api/workflows/:id', (req, res) => {
  const workflow = workflows.get(req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: '工作流不存在' });
  }
  res.json(workflow);
});

// 创建新工作流
app.post('/api/workflows', (req, res) => {
  const { name, description, nodes = [], connections = [] } = req.body;
  const workflow = {
    id: uuidv4(),
    name: name || '新工作流',
    description: description || '',
    nodes,
    connections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  workflows.set(workflow.id, workflow);
  res.json(workflow);
});

// 更新工作流
app.put('/api/workflows/:id', (req, res) => {
  const workflow = workflows.get(req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: '工作流不存在' });
  }
  
  const updatedWorkflow = {
    ...workflow,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  workflows.set(req.params.id, updatedWorkflow);
  res.json(updatedWorkflow);
});

// 删除工作流
app.delete('/api/workflows/:id', (req, res) => {
  if (!workflows.has(req.params.id)) {
    return res.status(404).json({ error: '工作流不存在' });
  }
  
  workflows.delete(req.params.id);
  res.json({ message: '工作流已删除' });
});

// 获取节点类型
app.get('/api/node-types', (req, res) => {
  res.json(nodeTypes);
});

// 执行工作流
app.post('/api/workflows/:id/execute', async (req, res) => {
  const workflow = workflows.get(req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: '工作流不存在' });
  }
  
  const executionId = uuidv4();
  const execution = {
    id: executionId,
    workflowId: req.params.id,
    status: 'running',
    startTime: new Date().toISOString(),
    currentNode: null,
    results: {},
    input: req.body.input || {}
  };
  
  workflowExecutions.set(executionId, execution);
  
  // 异步执行工作流
  executeWorkflow(workflow, execution);
  
  res.json({ executionId, status: 'started' });
});

// 获取执行状态
app.get('/api/executions/:id', (req, res) => {
  const execution = workflowExecutions.get(req.params.id);
  if (!execution) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  res.json(execution);
});

// 工作流执行引擎
async function executeWorkflow(workflow, execution) {
  try {
    // 找到开始节点
    const startNode = workflow.nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('未找到开始节点');
    }
    
    await executeNode(workflow, execution, startNode);
    
  } catch (error) {
    execution.status = 'failed';
    execution.error = error.message;
    execution.endTime = new Date().toISOString();
    
    broadcast({
      type: 'execution_failed',
      executionId: execution.id,
      error: error.message
    });
  }
}

async function executeNode(workflow, execution, node) {
  execution.currentNode = node.id;
  
  // 广播当前执行状态
  broadcast({
    type: 'node_executing',
    executionId: execution.id,
    nodeId: node.id
  });
  
  // 模拟节点执行
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let result = {};
  
  switch (node.type) {
    case 'start':
      result = { message: '工作流已启动', data: execution.input };
      break;
      
    case 'task':
      result = { 
        message: `任务 "${node.data?.title || node.id}" 已完成`,
        data: { processed: true, timestamp: new Date().toISOString() }
      };
      break;
      
    case 'condition':
      const condition = node.data?.condition || 'true';
      result = { condition: true, message: '条件判断完成' };
      break;
      
    case 'delay':
      const delayTime = node.data?.delay || 1000;
      await new Promise(resolve => setTimeout(resolve, delayTime));
      result = { message: `延时 ${delayTime}ms 完成` };
      break;
      
    case 'api':
      result = { 
        message: `API调用完成: ${node.data?.url || 'unknown'}`,
        data: { status: 200, response: 'mock data' }
      };
      break;
      
    case 'end':
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      result = { message: '工作流已完成' };
      
      broadcast({
        type: 'execution_completed',
        executionId: execution.id
      });
      
      return;
  }
  
  execution.results[node.id] = result;
  
  // 广播节点完成状态
  broadcast({
    type: 'node_completed',
    executionId: execution.id,
    nodeId: node.id,
    result
  });
  
  // 找到下一个节点
  const nextConnections = workflow.connections.filter(conn => conn.source === node.id);
  
  for (const connection of nextConnections) {
    const nextNode = workflow.nodes.find(n => n.id === connection.target);
    if (nextNode) {
      await executeNode(workflow, execution, nextNode);
    }
  }
}

// 静态文件路由（生产模式）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});