const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const producerRoutes = require('./routes/producer.routes');
const importDataRoutes = require('./routes/importData.routes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/import-csv', importDataRoutes);
app.use('/api/producers', producerRoutes);

module.exports = app;
