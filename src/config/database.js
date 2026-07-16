require('dotenv').config();
const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and configure your database connection.');
}

const useSsl =
  process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: useSsl ? { require: true, rejectUnauthorized: false } : false,
  },
});

module.exports = sequelize;
