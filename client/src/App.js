import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fab,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Add as AddIcon,
  FolderOpen as OpenIcon
} from '@mui/icons-material';

import NodePanel from './components/NodePanel';
import NodePropertiesPanel from './components/NodePropertiesPanel';
import WorkflowList from './components/WorkflowList';
import ExecutionPanel from './components/ExecutionPanel';
import CustomNode from './components/CustomNode';
import './App.css';

const nodeTypes = {
  customNode: CustomNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'customNode',
    position: { x: 250, y: 100 },
    data: { 
      label: '开始', 
      type: 'start',
      description: '工作流开始节点'
    },
  },
];

const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [nodePanel, setNodePanel] = useState(false);
  const [workflowListOpen, setWorkflowListOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [wsConnection, setWsConnection] = useState(null);
  const [executionStatus, setExecutionStatus] = useState(null);

  // WebSocket 连接
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000');
    
    ws.onopen = () => {
      console.log('WebSocket 连接已建立');
      setWsConnection(ws);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };
    
    ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
      setWsConnection(null);
    };
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'node_executing':
        updateNodeStatus(message.nodeId, 'executing');
        break;
      case 'node_completed':
        updateNodeStatus(message.nodeId, 'completed');
        break;
      case 'execution_completed':
        setExecutionStatus({ status: 'completed', message: '工作流执行完成' });
        showNotification('工作流执行完成', 'success');
        resetNodeStatuses();
        break;
      case 'execution_failed':
        setExecutionStatus({ status: 'failed', message: message.error });
        showNotification(`工作流执行失败: ${message.error}`, 'error');
        resetNodeStatuses();
        break;
      default:
        break;
    }
  };

  const updateNodeStatus = (nodeId, status) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, status } }
          : node
      )
    );
  };

  const resetNodeStatuses = () => {
    setTimeout(() => {
      setNodes(nds =>
        nds.map(node => ({
          ...node,
          data: { ...node.data, status: undefined }
        }))
      );
    }, 3000);
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const onNodeDrag = (event, node) => {
    setSelectedNode(node);
  };

  const addNewNode = (nodeType) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'customNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: getNodeTypeLabel(nodeType),
        type: nodeType,
        description: `${getNodeTypeLabel(nodeType)}节点`,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodePanel(false);
  };

  const getNodeTypeLabel = (type) => {
    const labels = {
      start: '开始',
      end: '结束',
      task: '任务',
      condition: '条件判断',
      parallel: '并行处理',
      merge: '合并',
      delay: '延时',
      api: 'API调用'
    };
    return labels[type] || type;
  };

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  };

  const saveWorkflow = async () => {
    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          position: node.position,
          data: node.data
        })),
        connections: edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      if (response.ok) {
        const savedWorkflow = await response.json();
        setCurrentWorkflow(savedWorkflow);
        setSaveDialogOpen(false);
        showNotification('工作流保存成功', 'success');
        loadWorkflows();
      } else {
        showNotification('保存失败', 'error');
      }
    } catch (error) {
      console.error('保存工作流失败:', error);
      showNotification('保存失败', 'error');
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const workflowList = await response.json();
        setWorkflows(workflowList);
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
    }
  };

  const loadWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (response.ok) {
        const workflow = await response.json();
        
        const loadedNodes = workflow.nodes.map(node => ({
          id: node.id,
          type: 'customNode',
          position: node.position,
          data: node.data
        }));
        
        const loadedEdges = workflow.connections.map(conn => ({
          id: `${conn.source}-${conn.target}`,
          source: conn.source,
          target: conn.target,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle
        }));
        
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setCurrentWorkflow(workflow);
        setWorkflowListOpen(false);
        showNotification('工作流加载成功', 'success');
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
      showNotification('加载失败', 'error');
    }
  };

  const executeWorkflow = async () => {
    if (!currentWorkflow) {
      showNotification('请先保存工作流', 'warning');
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${currentWorkflow.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: {} }),
      });

      if (response.ok) {
        const result = await response.json();
        setExecutionStatus({ status: 'running', executionId: result.executionId });
        showNotification('工作流开始执行', 'info');
      } else {
        showNotification('执行失败', 'error');
      }
    } catch (error) {
      console.error('执行工作流失败:', error);
      showNotification('执行失败', 'error');
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            可视化工作流编辑器
          </Typography>
          <Button color="inherit" onClick={() => setWorkflowListOpen(true)} startIcon={<OpenIcon />}>
            打开
          </Button>
          <Button color="inherit" onClick={() => setSaveDialogOpen(true)} startIcon={<SaveIcon />}>
            保存
          </Button>
          <Button color="inherit" onClick={executeWorkflow} startIcon={<PlayIcon />}>
            执行
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ height: 'calc(100vh - 64px)', p: 0 }}>
        <Box display="flex" height="100%">
          {/* 主编辑区域 */}
          <Box flex={1} position="relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodeDrag={onNodeDrag}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>

            {/* 添加节点按钮 */}
            <Fab
              color="primary"
              aria-label="add"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              onClick={() => setNodePanel(true)}
            >
              <AddIcon />
            </Fab>
          </Box>

          {/* 属性面板 */}
          {selectedNode && (
            <Paper sx={{ width: 300, p: 2, borderLeft: 1, borderColor: 'divider' }}>
              <NodePropertiesPanel
                node={selectedNode}
                onUpdateNode={updateNodeData}
                onDeleteNode={deleteSelectedNode}
              />
            </Paper>
          )}
        </Box>
      </Container>

      {/* 节点面板 */}
      <NodePanel
        open={nodePanel}
        onClose={() => setNodePanel(false)}
        onAddNode={addNewNode}
      />

      {/* 工作流列表 */}
      <WorkflowList
        open={workflowListOpen}
        onClose={() => setWorkflowListOpen(false)}
        workflows={workflows}
        onLoadWorkflow={loadWorkflow}
      />

      {/* 保存对话框 */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>保存工作流</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="工作流名称"
            fullWidth
            variant="outlined"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>取消</Button>
          <Button onClick={saveWorkflow}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* 执行状态面板 */}
      {executionStatus && (
        <ExecutionPanel
          status={executionStatus}
          onClose={() => setExecutionStatus(null)}
        />
      )}

      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
