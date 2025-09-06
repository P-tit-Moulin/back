const ProducerService = require('../services/producer.services');

class ProducerController {
  static async getProducers(req, res) {
    try {
      const result = await ProducerService.getProducers(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Erreur lors de la récupération des producteurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des producteurs',
        error: error.message,
      });
    }
  }

  static async getProducerById(req, res) {
    try {
      const producer = await ProducerService.getProducerById(req.params.id);
      res.json({ success: true, data: producer });
    } catch (error) {
      if (error.message === 'Producteur non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Erreur lors de la récupération du producteur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du producteur',
        error: error.message,
      });
    }
  }

  static async getProducersNearby(req, res) {
    try {
      const result = await ProducerService.getProducersNearby(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      if (error.message.includes('coordonnées')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Erreur lors de la recherche géographique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche géographique',
        error: error.message,
      });
    }
  }

  static async getProductFamilies(req, res) {
    try {
      const data = await ProducerService.getProductFamilies();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erreur lors de la récupération des familles:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des familles de produits',
        error: error.message,
      });
    }
  }
}

module.exports = ProducerController;
