require('dotenv').config();

const sslOptions = { require: true, rejectUnauthorized: false };

function buildConfig() {
  const useSsl =
    process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production';

  return {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: useSsl ? sslOptions : false,
    },
  };
}

module.exports = {
  development: buildConfig(),
  test: buildConfig(),
  production: buildConfig(),
};
