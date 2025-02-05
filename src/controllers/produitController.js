const Produit = require("../models/Produit");
const Producteur = require("../models/Producteur");

// 🔎 Récupérer un produit avec ses producteurs
exports.getProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id).populate("producteurs");
    if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Ajouter un produit
exports.createProduit = async (req, res) => {
  try {
    const newProduit = new Produit(req.body);
    await newProduit.save();
    res.status(201).json(newProduit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
