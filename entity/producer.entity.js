const mongoose = require('mongoose');

const producerSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  geometry: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  nom: String,
  adresse: String,
  com_name: String,
  code_postal: Number,
  description: String,
  familles_des_produits: [String],
  familles_des_produits_restreintes: [String],
});

producerSchema.index({ geometry: '2dsphere' });

const Producer = mongoose.model('Producer', producerSchema);

module.exports = Producer;
