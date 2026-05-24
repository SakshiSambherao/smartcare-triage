const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: true // Set to true so your old existing accounts don't crash the database
    },
    email: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    role: { 
        type: DataTypes.ENUM('patient', 'doctor', 'admin'), 
        allowNull: false 
    }
}, { timestamps: true });

module.exports = User;