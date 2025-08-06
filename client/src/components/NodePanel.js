import React from 'react';
import {
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
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

const nodeTypes = [
  {
    type: 'start',
    label: '开始',
    icon: StartIcon,
    description: '工作流的起点',
    color: '#4caf50',
  },
  {
    type: 'end',
    label: '结束',
    icon: EndIcon,
    description: '工作流的终点',
    color: '#f44336',
  },
  {
    type: 'task',
    label: '任务',
    icon: TaskIcon,
    description: '执行具体的任务操作',
    color: '#2196f3',
  },
  {
    type: 'condition',
    label: '条件判断',
    icon: ConditionIcon,
    description: '根据条件进行分支判断',
    color: '#ff9800',
  },
  {
    type: 'parallel',
    label: '并行处理',
    icon: ParallelIcon,
    description: '同时执行多个分支',
    color: '#9c27b0',
  },
  {
    type: 'merge',
    label: '合并',
    icon: MergeIcon,
    description: '合并多个分支的结果',
    color: '#607d8b',
  },
  {
    type: 'delay',
    label: '延时',
    icon: DelayIcon,
    description: '延时等待指定时间',
    color: '#795548',
  },
  {
    type: 'api',
    label: 'API调用',
    icon: ApiIcon,
    description: '调用外部API接口',
    color: '#00bcd4',
  },
];

function NodePanel({ open, onClose, onAddNode }) {
  const handleNodeClick = (nodeType) => {
    onAddNode(nodeType);
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 280, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          添加节点
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          选择要添加到工作流中的节点类型
        </Typography>
        
        <Divider />
        
        <List>
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <ListItem key={nodeType.type} disablePadding>
                <ListItemButton
                  onClick={() => handleNodeClick(nodeType.type)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: `${nodeType.color}20`,
                    },
                  }}
                >
                  <ListItemIcon>
                    <Icon sx={{ color: nodeType.color }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={nodeType.label}
                    secondary={nodeType.description}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        
        <Divider sx={{ mt: 2 }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            提示：拖拽节点到画布上来创建工作流
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default NodePanel;