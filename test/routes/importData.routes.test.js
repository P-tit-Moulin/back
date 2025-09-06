const request = require('supertest');
const express = require('express');

// Mock du contrôleur
jest.mock(
  '../../controllers/import.controller.js',
  () => ({
    importCSV: jest.fn(),
  }),
  { virtual: true },
);

const { importCSV } = require('../../controllers/import.controller.js');

describe('ImportData Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());

    // Créer la route manuellement
    const router = express.Router();
    router.post('/csv', importCSV);
    app.use('/import', router);
  });

  describe('POST /import/csv', () => {
    it("devrait renvoyer 200 si l'import est réussi", async () => {
      importCSV.mockImplementation((req, res) =>
        res.status(200).json({
          message: 'Import CSV terminé',
          imported: 5,
        }),
      );

      const res = await request(app).post('/import/csv');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'Import CSV terminé',
        imported: 5,
      });
      expect(importCSV).toHaveBeenCalled();
    });

    it("devrait renvoyer 500 si l'import échoue", async () => {
      importCSV.mockImplementation((req, res) =>
        res.status(500).json({
          message: "Erreur lors de l'import CSV",
          error: 'Erreur parsing CSV',
        }),
      );

      const res = await request(app).post('/import/csv');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        message: "Erreur lors de l'import CSV",
        error: 'Erreur parsing CSV',
      });
      expect(importCSV).toHaveBeenCalled();
    });
  });
});
