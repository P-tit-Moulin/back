const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const producerRoutes = require('./routes/producer.routes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/import-csv', producerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
