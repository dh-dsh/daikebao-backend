const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 解析环境变量
const mysqlAddress = process.env.MYSQL_ADDRESS || 'localhost:3306';
const [dbHost, dbPort] = mysqlAddress.split(':');
const dbUser = process.env.MYSQL_USERNAME || 'root';
const dbPassword = process.env.MYSQL_PASSWORD || '';
const dbName = process.env.DB_NAME || 'daikebao';
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
const wechatAppId = process.env.WECHAT_APPID || 'wxc7d9247d7be6b8a4';
const port = process.env.PORT || 3000;

// 连接数据库
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: console.log
});

// 测试数据库连接
sequelize.authenticate()
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

// 定义数据模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  school: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 5.0
  },
  orderCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  publisherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  acceptorId: {
    type: DataTypes.INTEGER
  },
  courseName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  courseType: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT
  },
  reward: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  }
});

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  frozen: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalEarning: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
});

// 同步数据库
sequelize.sync({ alter: true })
  .then(() => console.log('数据库同步成功'))
  .catch(err => console.error('数据库同步失败:', err));

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'daikebao-backend'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用代课宝后端服务',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        login: '/api/auth/login'
      },
      orders: {
        create: '/api/orders',
        list: '/api/orders',
        myPublished: '/api/orders/my-published',
        myAccepted: '/api/orders/my-accepted'
      },
      user: {
        profile: '/api/user/profile',
        wallet: '/api/user/wallet'
      }
    }
  });
});

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权' });
  }
  
  try {
    const decoded = require('jsonwebtoken').verify(token, jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: '无效的token' });
  }
};

// 认证接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    // 模拟微信登录
    console.log('登录请求:', { code });
    
    // 模拟用户数据
    const mockUser = {
      openid: 'mock_openid_' + Date.now(),
      nickname: '测试用户',
      avatar: 'https://via.placeholder.com/100',
      school: '测试大学'
    };
    
    // 查找或创建用户
    let user = await User.findOne({ where: { openid: mockUser.openid } });
    if (!user) {
      user = await User.create({
        openid: mockUser.openid,
        nickname: mockUser.nickname,
        avatar: mockUser.avatar,
        school: mockUser.school
      });
      
      // 创建钱包
      await Wallet.create({
        userId: user.id
      });
    }
    
    // 生成token
    const token = require('jsonwebtoken').sign(
      { id: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    res.json({
      code: 0,
      data: {
        token,
        openid: user.openid,
        userInfo: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          school: user.school,
          verified: user.verified,
          rating: user.rating,
          orderCount: user.orderCount
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 订单接口
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { courseName, courseType, date, timeSlot, location, requirements, reward } = req.body;
    
    const order = await Order.create({
      publisherId: req.userId,
      courseName,
      courseType,
      date,
      timeSlot,
      location,
      requirements,
      reward,
      status: 'pending'
    });
    
    res.json({
      code: 0,
      data: order,
      message: '订单发布成功'
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    // 获取当前用户
    const user = await User.findByPk(req.userId);
    
    // 只返回同校的订单
    const orders = await Order.findAll({
      where: {
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'publisher',
        attributes: ['nickname', 'avatar', 'school']
      }]
    });
    
    // 过滤同校订单
    const sameSchoolOrders = orders.filter(order => {
      // 这里需要关联查询获取发布者学校，简化处理
      return true; // 暂时返回所有订单
    });
    
    res.json({
      code: 0,
      data: {
        list: sameSchoolOrders,
        hasMore: false
      },
      message: '获取订单成功'
    });
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 用户接口
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    res.json({
      code: 0,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        school: user.school,
        verified: user.verified,
        rating: user.rating,
        orderCount: user.orderCount
      },
      message: '获取用户信息成功'
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

app.get('/api/user/wallet', authMiddleware, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.userId } });
    
    res.json({
      code: 0,
      data: {
        balance: wallet.balance,
        frozen: wallet.frozen,
        totalEarning: wallet.totalEarning
      },
      message: '获取钱包信息成功'
    });
  } catch (error) {
    console.error('获取钱包信息错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
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
  console.log(`API文档: http://localhost:${port}/`);
});
