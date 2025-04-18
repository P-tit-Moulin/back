const mongoose = require('mongoose');

const ProduitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Produit', ProduitSchema);