const mongoose = require("mongoose");

const producteurSchema = new mongoose.Schema({
  _id: String,
  nom: String,
  produits: [{ type: String, ref: "Produit" }],
});

module.exports = mongoose.model("Producteur", producteurSchema);
