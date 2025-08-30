const mongoose = require('mongoose');
const producerSchema = new mongoose.Schema(
  {
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

    prenom: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    nom_de_famille: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide'],
    },
    mdp: {
      type: String,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isUserAccount: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

producerSchema.index({ geometry: '2dsphere' });

producerSchema.index({ email: 1 }, { sparse: true });
producerSchema.index({ nom_de_famille: 1 }, { sparse: true });
producerSchema.index({ isUserAccount: 1 });

producerSchema.methods.toJSON = function () {
  const producerObject = this.toObject();
  delete producerObject.mdp;
  return producerObject;
};

const Producer = mongoose.model('Producer', producerSchema);

module.exports = Producer;
