const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = User;
