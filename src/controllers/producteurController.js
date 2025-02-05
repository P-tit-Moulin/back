const Producteur = require("../models/Producteur");
const Produit = require("../models/Produit");

// 🔎 Récupérer un producteur avec ses produits
exports.getProducteur = async (req, res) => {
  try {
    const producteur = await Producteur.findById(req.params.id).populate("produits");
    if (!producteur) return res.status(404).json({ message: "Producteur non trouvé" });
    res.json(producteur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Ajouter un producteur
exports.createProducteur = async (req, res) => {
  try {
    const newProducteur = new Producteur(req.body);
    await newProducteur.save();
    res.status(201).json(newProducteur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
