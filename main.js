require('./config/sentry.js');
const express = require('express');
const Sentry = require('@sentry/node');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const producerRoutes = require('./routes/producer.routes');
const importDataRoutes = require('./routes/importData.routes');
const userRoutes = require('./routes/user.routes');

dotenv.config();
connectDB();

const app = express();

app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.',
  skipSuccessfulRequests: true,
});

app.use(express.json({ limit: '10mb' }));

app.use(Sentry.Handlers.requestHandler());

app.use('/api/import-csv', importDataRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/users', authLimiter, userRoutes);

app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
