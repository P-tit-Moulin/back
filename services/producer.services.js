const Producer = require('../entity/producer.entity');

const EARTH_RADIUS_KM = 6378.1;

class ProducerService {
  static async getProducers({
    com_name,
    nom,
    geometry,
    radius = 10,
    familles_des_produits,
    page = 1,
    limit = 50,
  }) {
    const filters = {};

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

    return {
      data: producers,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: parseInt(limit),
      },
    };
  }

  static async getProducerById(id) {
    const producer = await Producer.findOne({ id: id });
    if (!producer) throw new Error('Producteur non trouvé');
    return producer;
  }

  static async getProducersNearby({ longitude, latitude, radius = 10 }) {
    if (!longitude || !latitude) {
      throw new Error('Les coordonnées longitude et latitude sont requises');
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

    return {
      data: producers,
      search_params: {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        radius_km: parseFloat(radius),
      },
    };
  }

  static async getProductFamilies() {
    const rawFamilies = await Producer.distinct('familles_des_produits');
    const rawRestricted = await Producer.distinct(
      'familles_des_produits_restreintes',
    );
    const splitAndUnique = (arr) => {
      return Array.from(
        new Set(
          arr
            .flatMap((item) => item.split(','))
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
    };

    return {
      familles_des_produits: splitAndUnique(rawFamilies),
      familles_des_produits_restreintes: splitAndUnique(rawRestricted),
    };
  }
}

module.exports = ProducerService;
