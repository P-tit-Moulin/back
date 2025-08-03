const express = require('express');
const ProducerController = require('../controllers/producer.controller');

const router = express.Router();

router.get('/', ProducerController.getProducers);

router.get('/nearby/search', ProducerController.getProducersNearby);

router.get('/:id', ProducerController.getProducerById);
router.get('/families/all', ProducerController.getProductFamilies);

module.exports = router;
