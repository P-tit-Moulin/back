const mongoose = require('mongoose');

const ProducteurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  local_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Local',
    required: true
  }
});

module.exports = mongoose.model('Producteur', ProducteurSchema);