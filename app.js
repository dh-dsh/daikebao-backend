const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 80;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '欢迎使用代课宝后端服务',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      login: '/api/auth/login'
    }
  });
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
  try {
    const { code } = req.body;
    
    // 模拟微信登录验证
    console.log('登录请求:', { code });
    
    // 模拟登录成功响应
    const response = {
      code: 0,
      data: {
        token: 'mock_token_' + Date.now(),
        openid: 'mock_openid_' + Date.now(),
        userInfo: {
          id: '1',
          nickname: '测试用户',
          avatar: 'https://via.placeholder.com/100',
          school: '测试大学',
          verified: false,
          rating: 5.0,
          orderCount: 0
        }
      },
      message: '登录成功'
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
  console.log(`健康检查: http://localhost:${port}/health`);
  console.log(`登录接口: http://localhost:${port}/api/auth/login`);
});
