import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import {
  AccountTree as WorkflowIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';

function WorkflowList({ open, onClose, workflows, onLoadWorkflow, onDeleteWorkflow }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WorkflowIcon />
          <Typography variant="h6">工作流列表</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {workflows.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <WorkflowIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              暂无工作流
            </Typography>
            <Typography variant="body2" color="text.secondary">
              创建您的第一个工作流来开始使用
            </Typography>
          </Box>
        ) : (
          <List>
            {workflows.map((workflow, index) => (
              <React.Fragment key={workflow.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onLoadWorkflow(workflow.id)}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {workflow.name}
                          </Typography>
                          <Chip
                            label={`${workflow.nodes?.length || 0} 节点`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {workflow.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {workflow.description}
                            </Typography>
                          )}
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              创建时间: {formatDate(workflow.createdAt)}
                            </Typography>
                            {workflow.updatedAt !== workflow.createdAt && (
                              <Typography variant="caption" color="text.secondary">
                                更新时间: {formatDate(workflow.updatedAt)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="open"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadWorkflow(workflow.id);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <OpenIcon />
                      </IconButton>
                      {onDeleteWorkflow && (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWorkflow(workflow.id);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
                {index < workflows.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WorkflowList;