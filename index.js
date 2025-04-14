require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur en écoute sur le port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('Erreur de connexion MongoDB :', err));