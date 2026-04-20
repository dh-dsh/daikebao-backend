const express = require('express');
const cors = require('cors');
const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
  try {
    const { code } = req.body;
    // 模拟登录成功
    const mockData = {
      code: 0,
      data: {
        token: 'mock_token_123456',
        openid: 'mock_openid_123456',
        userInfo: {
          id: '1',
          nickname: '测试用户',
          avatar: '/images/default-avatar.svg',
          school: '测试大学',
          verified: false,
          rating: 5.0,
          orderCount: 0
        }
      }
    };
    res.json(mockData);
  } catch (error) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 启动服务器
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});
