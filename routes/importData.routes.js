const express = require('express');
const router = express.Router();
const ImportController = require('../controllers/import.controller');

router.post('/', ImportController.importCSV);

module.exports = router;
