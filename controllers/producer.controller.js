const Producer = require('../entity/producer.entity');

class ProducerController {
  // Récupérer tous les producteurs avec filtres optionnels
  static async getProducers(req, res) {
    try {
      const {
        com_name,
        nom,
        geometry, // attendu sous la forme "lon,lat"
        radius = 10, // en kilomètres
        familles_des_produits,
        page = 1,
        limit = 50,
      } = req.query;

      const filters = {};
      const EARTH_RADIUS_KM = 6378.1;

      if (com_name) {
        filters.com_name = { $regex: com_name, $options: 'i' };
      }
      if (nom) {
        filters.nom = { $regex: nom, $options: 'i' };
      }
      if (familles_des_produits) {
        filters.familles_des_produits = {
          $in: Array.isArray(familles_des_produits)
            ? familles_des_produits
            : [familles_des_produits],
        };
      }

      if (geometry) {
        const [lon, lat] = geometry.split(',').map(parseFloat);
        if (!isNaN(lon) && !isNaN(lat)) {
          const radiusInRadians = parseFloat(radius) / EARTH_RADIUS_KM;
          filters.geometry = {
            $geoWithin: {
              $centerSphere: [[lon, lat], radiusInRadians],
            },
          };
        }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const producers = await Producer.find(filters)
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ nom: 1 });

      const total = await Producer.countDocuments(filters);

      res.json({
        success: true,
        data: producers,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des producteurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des producteurs',
        error: error.message,
      });
    }
  }

  // Récupérer un producteur par ID
  static async getProducerById(req, res) {
    try {
      const { id } = req.params;

      const producer = await Producer.findOne({ id: id });

      if (!producer) {
        return res.status(404).json({
          success: false,
          message: 'Producteur non trouvé',
        });
      }

      res.json({
        success: true,
        data: producer,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du producteur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du producteur',
        error: error.message,
      });
    }
  }

  // Recherche géographique dans un rayon
  static async getProducersNearby(req, res) {
    try {
      const { longitude, latitude, radius = 10 } = req.query;

      if (!longitude || !latitude) {
        return res.status(400).json({
          success: false,
          message: 'Les coordonnées longitude et latitude sont requises',
        });
      }

      const producers = await Producer.find({
        geometry: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseFloat(radius) * 1000,
          },
        },
      }).limit(50);

      res.json({
        success: true,
        data: producers,
        search_params: {
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
          radius_km: parseFloat(radius),
        },
      });
    } catch (error) {
      console.error('Erreur lors de la recherche géographique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche géographique',
        error: error.message,
      });
    }
  }

  // Obtenir toutes les familles de produits disponibles
  static async getProductFamilies(req, res) {
    try {
      // On récupère les valeurs brutes
      const rawFamilies = await Producer.distinct('familles_des_produits');
      const rawRestricted = await Producer.distinct('familles_des_produits_restreintes');

      // Helper pour séparer, nettoyer et dédupliquer
      const splitAndUnique = (arr) => {
        return Array.from(
          new Set(
            arr
              .flatMap((item) => item.split(','))
              .map((s) => s.trim())
              .filter(Boolean)
          )
        );
      };

      // On applique la transformation
      const familles = splitAndUnique(rawFamilies);
      const famillesRestreintes = splitAndUnique(rawRestricted);

      // On renvoie le résultat
      res.json({
        success: true,
        data: {
          familles_des_produits: familles,
          familles_des_produits_restreintes: famillesRestreintes,
        },
      });
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
