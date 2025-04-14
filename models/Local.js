const mongoose = require('mongoose');

const AdresseSchema = new mongoose.Schema({
  rue: { type: String },
  ville: { type: String },
  code_postal: { type: String },
  pays: { type: String },
  geo: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { _id: false });

const LocalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ferme', 'magasin'],
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  adresse: {
    type: AdresseSchema,
    required: true
  }
});

LocalSchema.index({ 'adresse.geo': '2dsphere' });

module.exports = mongoose.model('Local', LocalSchema);