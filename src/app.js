require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const swaggerSpec = require('./config/swagger');
const { configurePassport } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  configurePassport();
  app.use(passport.initialize());

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'API is running' });
  });

  app.use('/auth', authRoutes);
  app.use('/stores', storeRoutes);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
