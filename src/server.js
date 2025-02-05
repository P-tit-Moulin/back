require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Importation des routes
const producteurRoutes = require("./routes/producteurRoutes");
const produitRoutes = require("./routes/produitRoutes");

app.use("/producteurs", producteurRoutes);
app.use("/produits", produitRoutes);

// Middleware pour gérer les erreurs
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
