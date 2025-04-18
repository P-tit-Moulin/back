const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  producteur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producteur',
    required: true
  },
  produit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 0
  }
});

module.exports = mongoose.model('Stock', StockSchema);