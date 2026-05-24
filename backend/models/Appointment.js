const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appointment = sequelize.define('Appointment', {
    patientName: { type: DataTypes.STRING, allowNull: false },
    patientEmail: { type: DataTypes.STRING, allowNull: false },
    disease: { type: DataTypes.STRING },
    priorityScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { 
        type: DataTypes.ENUM('waiting', 'in_progress', 'treated', 'cancelled'), 
        defaultValue: 'waiting' 
    },
    scheduledTime: { type: DataTypes.DATE }
}, { timestamps: true });

module.exports = Appointment;