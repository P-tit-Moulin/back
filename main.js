require('./config/sentry.js');
const express = require('express');
const cors = require('cors');
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

app.use(
  cors({
    origin: ['https://pre-prod.ptit-moulin.fr', 'http://localhost:5173'],
    credentials: true,
  }),
);

app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
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

Sentry.setupExpressErrorHandler(app);

app.use('/api/import-csv', cors(), importDataRoutes);
app.use('/api/producers', cors(), producerRoutes);
app.use('/api/users', authLimiter, cors(), userRoutes);

module.exports = app;
