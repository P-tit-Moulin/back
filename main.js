require('./config/sentry.js');
const express = require('express');
const Sentry = require('@sentry/node');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const producerRoutes = require('./routes/producer.routes');
const importDataRoutes = require('./routes/importData.routes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(Sentry.Handlers.requestHandler());

app.use('/api/import-csv', importDataRoutes);
app.use('/api/producers', producerRoutes);

app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
