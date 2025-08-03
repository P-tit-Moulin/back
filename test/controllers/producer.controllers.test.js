const ProducerController = require('../../controllers/producer.controller');
const Producer = require('../../entity/producer.entity');

jest.mock('../../entity/producer.entity');

describe('ProducerController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      query: {},
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  describe('getProducers', () => {
    it('should return all producers with default pagination when no filters provided', async () => {
      // Arrange
      const fakeProducers = [{ id: '1' }, { id: '2' }];
      Producer.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(fakeProducers),
      });
      Producer.countDocuments.mockResolvedValue(2);

      // Act
      await ProducerController.getProducers(req, res);

      // Assert
      expect(Producer.find).toHaveBeenCalledWith({});
      expect(Producer.countDocuments).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeProducers,
        pagination: {
          current_page: 1,
          total_pages: Math.ceil(2 / 50),
          total_items: 2,
          items_per_page: 50,
        },
      });
    });

    it('should apply filters and geo-filters when provided', async () => {
      // Arrange: set query params
      req.query = {
        com_name: 'Paris',
        nom: 'Prod',
        geometry: '2.35,48.85',
        radius: '5',
        familles_des_produits: ['foo', 'bar'],
        page: '2',
        limit: '10',
      };

      const fakeProducers = [{ id: 'x' }];
      const mockFind = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(fakeProducers),
      };
      Producer.find.mockReturnValue(mockFind);
      Producer.countDocuments.mockResolvedValue(1);

      // Act
      await ProducerController.getProducers(req, res);

      // Assert filters object
      const earthRadius = 6378.1;
      const expectedRadius = parseFloat(req.query.radius) / earthRadius;
      expect(Producer.find).toHaveBeenCalledWith({
        com_name: { $regex: 'Paris', $options: 'i' },
        nom: { $regex: 'Prod', $options: 'i' },
        familles_des_produits: { $in: ['foo', 'bar'] },
        geometry: {
          $geoWithin: {
            $centerSphere: [[2.35, 48.85], expectedRadius],
          },
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeProducers,
        pagination: {
          current_page: 2,
          total_pages: Math.ceil(1 / 10),
          total_items: 1,
          items_per_page: 10,
        },
      });
    });

    it('should catch and return 500 on error', async () => {
      // Arrange
      Producer.find.mockImplementation(() => {
        throw new Error('fail');
      });

      // Act
      await ProducerController.getProducers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des producteurs',
        error: 'fail',
      });
    });
  });

  describe('getProducerById', () => {
    it('should return 404 when producer not found', async () => {
      // Arrange
      req.params.id = 'unknown';
      Producer.findOne.mockResolvedValue(null);

      // Act
      await ProducerController.getProducerById(req, res);

      // Assert
      expect(Producer.findOne).toHaveBeenCalledWith({ id: 'unknown' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producteur non trouvé',
      });
    });

    it('should return producer when found', async () => {
      // Arrange
      const fake = { id: '1', nom: 'Test' };
      req.params.id = '1';
      Producer.findOne.mockResolvedValue(fake);

      // Act
      await ProducerController.getProducerById(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fake,
      });
    });

    it('should catch and return 500 on error', async () => {
      // Arrange
      req.params.id = '1';
      Producer.findOne.mockRejectedValue(new Error('boom'));

      // Act
      await ProducerController.getProducerById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération du producteur',
        error: 'boom',
      });
    });
  });

  describe('getProducersNearby', () => {
    it('should return 400 if coords missing', async () => {
      // Arrange: no longitude/latitude in query
      req.query = {};

      // Act
      await ProducerController.getProducersNearby(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Les coordonnées longitude et latitude sont requises',
      });
    });

    it('should return nearby producers when coords provided', async () => {
      // Arrange
      req.query = { longitude: '1.0', latitude: '2.0', radius: '3' };
      const fakeProducers = [{ id: 'n1' }];
      Producer.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(fakeProducers),
      });

      // Act
      await ProducerController.getProducersNearby(req, res);

      // Assert
      expect(Producer.find).toHaveBeenCalledWith({
        geometry: {
          $near: {
            $geometry: { type: 'Point', coordinates: [1.0, 2.0] },
            $maxDistance: 3000,
          },
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeProducers,
        search_params: {
          longitude: 1.0,
          latitude: 2.0,
          radius_km: 3,
        },
      });
    });

    it('should catch and return 500 on error', async () => {
      // Arrange
      req.query = { longitude: '1', latitude: '2' };
      Producer.find.mockImplementation(() => {
        throw new Error('err');
      });

      // Act
      await ProducerController.getProducersNearby(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la recherche géographique',
        error: 'err',
      });
    });
  });

  describe('getProductFamilies', () => {
    it('should return unique split families and restricted families', async () => {
      // Arrange
      Producer.distinct
        .mockResolvedValueOnce(['a,b', 'c'])
        .mockResolvedValueOnce(['x', 'y,z', '']);

      // Act
      await ProducerController.getProductFamilies(req, res);

      // Assert
      expect(Producer.distinct).toHaveBeenNthCalledWith(
        1,
        'familles_des_produits',
      );
      expect(Producer.distinct).toHaveBeenNthCalledWith(
        2,
        'familles_des_produits_restreintes',
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          familles_des_produits: ['a', 'b', 'c'],
          familles_des_produits_restreintes: ['x', 'y', 'z'],
        },
      });
    });

    it('should catch and return 500 on error', async () => {
      // Arrange
      Producer.distinct.mockRejectedValue(new Error('fail fam'));

      // Act
      await ProducerController.getProductFamilies(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des familles de produits',
        error: 'fail fam',
      });
    });
  });
});
