const ProducerController = require('../../controllers/producer.controller');
const ProducerService = require('../../services/producer.services');

// On mocke le service
jest.mock('../../services/producer.services');

describe('ProducerController', () => {
  let req, res;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // GET PRODUCERS
  describe('getProducers', () => {
    it('devrait renvoyer 200 avec la liste des producteurs', async () => {
      const fakeResult = { data: [{ id: 1, nom: 'Test' }], total: 1 };
      ProducerService.getProducers.mockResolvedValue(fakeResult);

      await ProducerController.getProducers(req, res);

      expect(ProducerService.getProducers).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...fakeResult,
      });
    });

    it('devrait renvoyer 500 en cas derreur', async () => {
      ProducerService.getProducers.mockRejectedValue(new Error('Erreur BDD'));

      await ProducerController.getProducers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des producteurs',
        error: 'Erreur BDD',
      });
    });
  });

  // GET PRODUCER BY ID
  describe('getProducerById', () => {
    it('devrait renvoyer un producteur', async () => {
      req.params.id = '1';
      const producer = { id: 1, nom: 'Fermier' };
      ProducerService.getProducerById.mockResolvedValue(producer);

      await ProducerController.getProducerById(req, res);

      expect(ProducerService.getProducerById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: producer,
      });
    });

    it('devrait renvoyer 404 si producteur non trouvé', async () => {
      req.params.id = '1';
      ProducerService.getProducerById.mockRejectedValue(
        new Error('Producteur non trouvé'),
      );

      await ProducerController.getProducerById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producteur non trouvé',
      });
    });

    it('devrait renvoyer 500 pour une autre erreur', async () => {
      req.params.id = '1';
      ProducerService.getProducerById.mockRejectedValue(
        new Error('Erreur serveur'),
      );

      await ProducerController.getProducerById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération du producteur',
        error: 'Erreur serveur',
      });
    });
  });

  // GET PRODUCERS NEARBY
  describe('getProducersNearby', () => {
    it('devrait renvoyer les producteurs proches', async () => {
      const fakeResult = { data: [{ id: 2, nom: 'Bio local' }], total: 1 };
      ProducerService.getProducersNearby.mockResolvedValue(fakeResult);

      await ProducerController.getProducersNearby(req, res);

      expect(ProducerService.getProducersNearby).toHaveBeenCalledWith(
        req.query,
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...fakeResult,
      });
    });

    it('devrait renvoyer 400 si erreur sur les coordonnées', async () => {
      ProducerService.getProducersNearby.mockRejectedValue(
        new Error('coordonnées invalides'),
      );

      await ProducerController.getProducersNearby(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'coordonnées invalides',
      });
    });

    it('devrait renvoyer 500 pour une autre erreur', async () => {
      ProducerService.getProducersNearby.mockRejectedValue(
        new Error('Erreur BDD'),
      );

      await ProducerController.getProducersNearby(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la recherche géographique',
        error: 'Erreur BDD',
      });
    });
  });

  // GET PRODUCT FAMILIES
  describe('getProductFamilies', () => {
    it('devrait renvoyer les familles de produits', async () => {
      const families = ['Fruits', 'Légumes'];
      ProducerService.getProductFamilies.mockResolvedValue(families);

      await ProducerController.getProductFamilies(req, res);

      expect(ProducerService.getProductFamilies).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: families,
      });
    });

    it('devrait renvoyer 500 si erreur', async () => {
      ProducerService.getProductFamilies.mockRejectedValue(
        new Error('Erreur Mongo'),
      );

      await ProducerController.getProductFamilies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des familles de produits',
        error: 'Erreur Mongo',
      });
    });
  });
});
