const express = require('express');
const request = require('supertest');

// Mock the controller methods
jest.mock('../../controllers/producer.controller', () => ({
  getProducers: jest.fn((req, res) => res.json({ called: 'getProducers' })),
  getProducersNearby: jest.fn((req, res) =>
    res.json({ called: 'getProducersNearby' }),
  ),
  getProducerById: jest.fn((req, res) =>
    res.json({ called: 'getProducerById', id: req.params.id }),
  ),
  getProductFamilies: jest.fn((req, res) =>
    res.json({ called: 'getProductFamilies' }),
  ),
}));

const ProducerController = require('../../controllers/producer.controller');
const producerRouter = require('../../routes/producer.routes');

describe('Producer Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // mount the producer router under /producers
    app.use('/producers', producerRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /producers should call getProducers', async () => {
    const res = await request(app).get('/producers');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getProducers' });
    expect(ProducerController.getProducers).toHaveBeenCalledTimes(1);
  });

  it('GET /producers/nearby/search should call getProducersNearby', async () => {
    const res = await request(app).get('/producers/nearby/search');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getProducersNearby' });
    expect(ProducerController.getProducersNearby).toHaveBeenCalledTimes(1);
  });

  it('GET /producers/families/all should call getProductFamilies', async () => {
    const res = await request(app).get('/producers/families/all');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getProductFamilies' });
    expect(ProducerController.getProductFamilies).toHaveBeenCalledTimes(1);
  });

  it('GET /producers/:id should call getProducerById with the right param', async () => {
    const testId = 'abc123';
    const res = await request(app).get(`/producers/${testId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getProducerById', id: testId });
    expect(ProducerController.getProducerById).toHaveBeenCalledTimes(1);
  });
});
