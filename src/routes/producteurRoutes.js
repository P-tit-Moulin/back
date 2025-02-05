const express = require("express");
const router = express.Router();
const { getProducteur, createProducteur } = require("../controllers/producteurController");

router.get("/:id", getProducteur);
router.post("/", createProducteur);

module.exports = router;