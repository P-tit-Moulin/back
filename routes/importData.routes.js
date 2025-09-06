const express = require('express');
const router = express.Router();
const { importCSV } = require('../controllers/import.controller.js');

router.post('/', async (req, res) => {
  try {
    const result = await importCSV();
    res.json({ message: 'Import CSV terminé', ...result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'import CSV", error: error.message });
  }
});

module.exports = router;
