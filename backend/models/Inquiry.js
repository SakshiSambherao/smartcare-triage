const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Ensure this path matches your setup

const Inquiry = sequelize.define('Inquiry', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = Inquiry;