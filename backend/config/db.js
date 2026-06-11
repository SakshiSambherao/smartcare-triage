const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306, // <--- The Magic Line
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
            ssl: process.env.DB_HOST !== 'localhost' ? { // Only use SSL if NOT on localhost
                require: true,
                rejectUnauthorized: false
            } : false
        },
        timezone: '+05:30', // India Standard Time
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Workbench Connected Successfully!');
    } catch (err) {
        console.error('❌ Connection Error:', err.message);
    }
};

module.exports = { sequelize, connectDB };