const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Doctor = sequelize.define('Doctor', {
    name: { type: DataTypes.STRING, allowNull: false },
    specialization: { type: DataTypes.STRING },
    status: { 
        type: DataTypes.ENUM('available', 'on_break', 'offline'), 
        defaultValue: 'available' 
    }
}, { timestamps: true });

module.exports = Doctor;