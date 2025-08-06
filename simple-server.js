const http = require('http');

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>简单测试服务器</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background: linear-gradient(135deg, #74b9ff, #0984e3);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .btn {
            background: #00b894;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 10px;
            display: inline-block;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 连接测试成功！</h1>
        <p>这是一个运行在端口 8080 的简单测试服务器</p>
        <p>当前时间: ${new Date().toLocaleString()}</p>
        <p>如果您能看到这个页面，说明网络连接正常！</p>
        <a href="http://localhost:3001" class="btn">🎨 访问工作流编辑器</a>
        <a href="http://localhost:3001/test" class="btn">🔍 访问诊断页面</a>
    </div>
</body>
</html>
    `);
  } else if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      message: '简单API测试成功',
      timestamp: new Date().toISOString(),
      port: 8080
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('页面不存在');
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 简单测试服务器运行在端口 ${PORT}`);
  console.log(`📱 访问地址:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log(`   http://0.0.0.0:${PORT}`);
});