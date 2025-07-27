const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONG_DB);
    console.log('✅ MongoDB Atlas connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB :', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
