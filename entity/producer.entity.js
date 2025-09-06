const mongoose = require('mongoose');

const producerSchema = new mongoose.Schema(
  {
    geometry: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    nom: String,
    adresse: String,
    com_name: String,
    code_postal: Number,
    description: String,
    familles_des_produits: [String],
    familles_des_produits_restreintes: [String],

    prenom: { type: String, trim: true, minlength: 2, maxlength: 50 },
    nom_de_famille: { type: String, trim: true, minlength: 2, maxlength: 50 },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide'],
    },

    mdp: { type: String, minlength: 8 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
);

producerSchema.index({ geometry: '2dsphere' });
producerSchema.index({ email: 1 }, { unique: true, sparse: true });
producerSchema.index({ nom_de_famille: 1 }, { sparse: true });

producerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.mdp;
  return obj;
};

module.exports = mongoose.model('Producer', producerSchema);
