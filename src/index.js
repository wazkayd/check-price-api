require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Copy .env.example to .env and set a secret key.');
}

const PORT = Number(process.env.PORT) || 3000;

const createApp = require('./app');
const sequelize = require('./config/database');

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
      } else {
        console.error('Server failed to start:', error.message);
      }

      process.exit(1);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
