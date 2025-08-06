import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button
} from '@mui/material';

function App() {
  const testAPI = async () => {
    try {
      const response = await fetch('/api/node-types');
      if (response.ok) {
        const data = await response.json();
        alert('API测试成功！节点类型数量: ' + Object.keys(data).length);
      } else {
        alert('API测试失败: ' + response.status);
      }
    } catch (error) {
      alert('API连接错误: ' + error.message);
    }
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            可视化工作流编辑器 - 简化版
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            🎯 工作流编辑器
          </Typography>
          
          <Typography variant="body1" paragraph>
            这是一个可视化工作流编辑器的简化测试版本。
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={testAPI}
              sx={{ mr: 2 }}
            >
              测试API连接
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              系统状态
            </Typography>
            <Typography variant="body2">
              前端: 运行在 http://localhost:3000
            </Typography>
            <Typography variant="body2">
              后端: 运行在 http://localhost:3001
            </Typography>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="white">
              如果您能看到这个页面，说明React应用已经成功加载！
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default App;
