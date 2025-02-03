const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema({
  _id: String,
  nom: String,
  producteurs: [{ type: String, ref: "Producteur" }],
});

module.exports = mongoose.model("Produit", produitSchema);
