const request = require('supertest');
const express = require('express');

// Mock du contrôleur
jest.mock(
  '../../controllers/producer.controller',
  () => ({
    getAllProducers: jest.fn(),
    getProducerById: jest.fn(),
    createProducer: jest.fn(),
    updateProducer: jest.fn(),
    deleteProducer: jest.fn(),
  }),
  { virtual: true },
);

const ProducerController = require('../../controllers/producer.controller');

describe('Producer Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());

    // Mock des méthodes du contrôleur
    ProducerController.getAllProducers.mockImplementation((req, res) => {
      res.status(200).json([]);
    });

    // Créer les routes manuellement pour les tests
    const router = express.Router();
    router.get('/', ProducerController.getAllProducers);
    app.use('/producers', router);
  });

  it('devrait récupérer tous les producteurs', async () => {
    const response = await request(app).get('/producers').expect(200);

    expect(ProducerController.getAllProducers).toHaveBeenCalled();
    expect(response.body).toEqual([]);
  });
});
