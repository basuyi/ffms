import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Box,
  Typography,
  Chip,
  Avatar
} from '@mui/material';
import {
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

function CustomNode({ data, selected }) {
  const Icon = nodeIcons[data.type] || TaskIcon;
  const color = nodeColors[data.type] || '#2196f3';
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'executing':
        return '#ff9800';
      case 'completed':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      default:
        return color;
    }
  };

  const shouldShowInput = data.type !== 'start';
  const shouldShowOutput = data.type !== 'end';
  const showMultipleOutputs = ['condition', 'parallel'].includes(data.type);
  const showMultipleInputs = data.type === 'merge';

  return (
    <>
      {/* 输入连接点 */}
      {shouldShowInput && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{
              background: getStatusColor(data.status),
              border: '2px solid white',
              width: 12,
              height: 12,
            }}
          />
          {showMultipleInputs && (
            <Handle
              type="target"
              position={Position.Left}
              id="input2"
              style={{
                background: getStatusColor(data.status),
                border: '2px solid white',
                width: 12,
                height: 12,
                top: '75%',
              }}
            />
          )}
        </>
      )}

      {/* 节点主体 */}
      <Box
        sx={{
          minWidth: 150,
          padding: 2,
          borderRadius: 2,
          border: selected ? `3px solid ${color}` : `2px solid ${getStatusColor(data.status)}`,
          backgroundColor: 'white',
          boxShadow: selected ? 4 : 2,
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        {/* 状态指示器 */}
        {data.status && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: getStatusColor(data.status),
              animation: data.status === 'executing' ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.95)',
                  boxShadow: `0 0 0 0 ${getStatusColor(data.status)}4d`,
                },
                '70%': {
                  transform: 'scale(1)',
                  boxShadow: `0 0 0 10px ${getStatusColor(data.status)}00`,
                },
                '100%': {
                  transform: 'scale(0.95)',
                  boxShadow: `0 0 0 0 ${getStatusColor(data.status)}00`,
                },
              },
            }}
          />
        )}

        {/* 节点图标和标题 */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Avatar
            sx={{
              bgcolor: getStatusColor(data.status),
              width: 32,
              height: 32,
            }}
          >
            <Icon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontSize="14px" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>

        {/* 节点描述 */}
        {data.description && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {data.description}
          </Typography>
        )}

        {/* 节点特定信息 */}
        {data.type === 'delay' && data.delay && (
          <Chip
            label={`${data.delay}ms`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {data.type === 'api' && data.url && (
          <Chip
            label={data.method || 'GET'}
            size="small"
            color="secondary"
            variant="outlined"
          />
        )}

        {data.type === 'condition' && data.condition && (
          <Typography variant="caption" display="block" mt={1}>
            条件: {data.condition}
          </Typography>
        )}

        {data.type === 'task' && data.title && (
          <Typography variant="caption" display="block" mt={1}>
            {data.title}
          </Typography>
        )}
      </Box>

      {/* 输出连接点 */}
      {shouldShowOutput && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{
              background: getStatusColor(data.status),
              border: '2px solid white',
              width: 12,
              height: 12,
            }}
          />
          {showMultipleOutputs && (
            <>
              <Handle
                type="source"
                position={Position.Right}
                id="output-true"
                style={{
                  background: '#4caf50',
                  border: '2px solid white',
                  width: 12,
                  height: 12,
                  top: '25%',
                }}
              />
              <Handle
                type="source"
                position={Position.Right}
                id="output-false"
                style={{
                  background: '#f44336',
                  border: '2px solid white',
                  width: 12,
                  height: 12,
                  top: '75%',
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

export default CustomNode;