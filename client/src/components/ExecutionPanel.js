import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  PlayArrow as RunningIcon,
} from '@mui/icons-material';

function ExecutionPanel({ status, onClose }) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'running':
        return <RunningIcon color="primary" />;
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <RunningIcon />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'running':
        return '执行中';
      case 'completed':
        return '执行完成';
      case 'failed':
        return '执行失败';
      default:
        return '未知状态';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        p: 2,
        zIndex: 1000,
        backgroundColor: 'background.paper',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          {getStatusIcon()}
          <Typography variant="h6">工作流执行</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box mb={2}>
        <Chip
          label={getStatusText()}
          color={getStatusColor()}
          variant="outlined"
          size="small"
        />
        {status.executionId && (
          <Typography variant="caption" display="block" color="text.secondary" mt={1}>
            执行 ID: {status.executionId}
          </Typography>
        )}
      </Box>

      {status.status === 'running' && (
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            正在执行工作流...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {status.status === 'completed' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {status.message || '工作流执行成功完成'}
        </Alert>
      )}

      {status.status === 'failed' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status.message || '工作流执行失败'}
        </Alert>
      )}

      {status.details && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            执行详情
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {status.details}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default ExecutionPanel;