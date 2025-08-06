import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  Assignment as TaskIcon,
  Help as ConditionIcon,
  CallSplit as ParallelIcon,
  CallMerge as MergeIcon,
  Schedule as DelayIcon,
  Api as ApiIcon,
} from '@mui/icons-material';

const nodeIcons = {
  start: StartIcon,
  end: EndIcon,
  task: TaskIcon,
  condition: ConditionIcon,
  parallel: ParallelIcon,
  merge: MergeIcon,
  delay: DelayIcon,
  api: ApiIcon,
};

const nodeColors = {
  start: '#4caf50',
  end: '#f44336',
  task: '#2196f3',
  condition: '#ff9800',
  parallel: '#9c27b0',
  merge: '#607d8b',
  delay: '#795548',
  api: '#00bcd4',
};

function NodePropertiesPanel({ node, onUpdateNode, onDeleteNode }) {
  const [label, setLabel] = useState(node.data.label || '');
  const [description, setDescription] = useState(node.data.description || '');
  const [nodeSpecificProps, setNodeSpecificProps] = useState({});

  useEffect(() => {
    setLabel(node.data.label || '');
    setDescription(node.data.description || '');
    
    // 初始化节点特定属性
    const props = {};
    switch (node.data.type) {
      case 'task':
        props.title = node.data.title || '';
        props.command = node.data.command || '';
        break;
      case 'condition':
        props.condition = node.data.condition || '';
        props.operator = node.data.operator || 'equals';
        props.value = node.data.value || '';
        break;
      case 'delay':
        props.delay = node.data.delay || 1000;
        break;
      case 'api':
        props.url = node.data.url || '';
        props.method = node.data.method || 'GET';
        props.headers = node.data.headers || '{}';
        props.body = node.data.body || '';
        break;
      default:
        break;
    }
    setNodeSpecificProps(props);
  }, [node]);

  const handleUpdate = () => {
    const updatedData = {
      label,
      description,
      ...nodeSpecificProps,
    };
    onUpdateNode(node.id, updatedData);
  };

  const handleSpecificPropChange = (prop, value) => {
    setNodeSpecificProps(prev => ({
      ...prev,
      [prop]: value,
    }));
  };

  const Icon = nodeIcons[node.data.type] || TaskIcon;
  const color = nodeColors[node.data.type] || '#2196f3';

  const renderNodeSpecificFields = () => {
    switch (node.data.type) {
      case 'task':
        return (
          <>
            <TextField
              label="任务标题"
              fullWidth
              margin="normal"
              value={nodeSpecificProps.title || ''}
              onChange={(e) => handleSpecificPropChange('title', e.target.value)}
            />
            <TextField
              label="执行命令"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={nodeSpecificProps.command || ''}
              onChange={(e) => handleSpecificPropChange('command', e.target.value)}
            />
          </>
        );
        
      case 'condition':
        return (
          <>
            <TextField
              label="条件表达式"
              fullWidth
              margin="normal"
              value={nodeSpecificProps.condition || ''}
              onChange={(e) => handleSpecificPropChange('condition', e.target.value)}
              placeholder="例如: status == 'success'"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>操作符</InputLabel>
              <Select
                value={nodeSpecificProps.operator || 'equals'}
                onChange={(e) => handleSpecificPropChange('operator', e.target.value)}
                label="操作符"
              >
                <MenuItem value="equals">等于</MenuItem>
                <MenuItem value="not_equals">不等于</MenuItem>
                <MenuItem value="greater_than">大于</MenuItem>
                <MenuItem value="less_than">小于</MenuItem>
                <MenuItem value="contains">包含</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="比较值"
              fullWidth
              margin="normal"
              value={nodeSpecificProps.value || ''}
              onChange={(e) => handleSpecificPropChange('value', e.target.value)}
            />
          </>
        );
        
      case 'delay':
        return (
          <TextField
            label="延时时间 (毫秒)"
            type="number"
            fullWidth
            margin="normal"
            value={nodeSpecificProps.delay || 1000}
            onChange={(e) => handleSpecificPropChange('delay', parseInt(e.target.value) || 1000)}
          />
        );
        
      case 'api':
        return (
          <>
            <TextField
              label="API URL"
              fullWidth
              margin="normal"
              value={nodeSpecificProps.url || ''}
              onChange={(e) => handleSpecificPropChange('url', e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>HTTP 方法</InputLabel>
              <Select
                value={nodeSpecificProps.method || 'GET'}
                onChange={(e) => handleSpecificPropChange('method', e.target.value)}
                label="HTTP 方法"
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="请求头 (JSON)"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={nodeSpecificProps.headers || '{}'}
              onChange={(e) => handleSpecificPropChange('headers', e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
            />
            {(['POST', 'PUT', 'PATCH'].includes(nodeSpecificProps.method)) && (
              <TextField
                label="请求体"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={nodeSpecificProps.body || ''}
                onChange={(e) => handleSpecificPropChange('body', e.target.value)}
                placeholder='{"key": "value"}'
              />
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* 节点头部信息 */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Avatar sx={{ bgcolor: color }}>
          <Icon />
        </Avatar>
        <Box>
          <Typography variant="h6">{node.data.label}</Typography>
          <Chip label={node.data.type} size="small" variant="outlined" />
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 基本属性 */}
      <Typography variant="subtitle2" gutterBottom>
        基本属性
      </Typography>
      
      <TextField
        label="节点名称"
        fullWidth
        margin="normal"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      
      <TextField
        label="描述"
        fullWidth
        multiline
        rows={2}
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 节点特定属性 */}
      {renderNodeSpecificFields() && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            节点配置
          </Typography>
          {renderNodeSpecificFields()}
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* 操作按钮 */}
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          fullWidth
        >
          更新属性
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onDeleteNode}
          startIcon={<DeleteIcon />}
        >
          删除
        </Button>
      </Box>

      {/* 节点信息 */}
      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          节点 ID: {node.id}
        </Typography>
      </Box>
    </Box>
  );
}

export default NodePropertiesPanel;