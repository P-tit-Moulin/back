const mongoose = require('mongoose');

const ProducteurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mot_de_passe: {
      type: String,
      required: true,
    },
    metier: {
      type: String,
      enum: ['agriculteur', 'éleveur', 'apiculteur', 'maraîcher', 'autre'],
      required: true,
    },
    local_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Local',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Producteur', ProducteurSchema);
