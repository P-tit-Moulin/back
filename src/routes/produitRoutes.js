const express = require("express");
const router = express.Router();
const { getProduit, createProduit } = require("../controllers/produitController");

router.get("/:id", getProduit);
router.post("/", createProduit);

module.exports = router;
