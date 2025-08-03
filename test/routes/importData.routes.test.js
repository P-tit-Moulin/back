const express = require('express');
const request = require('supertest');

// on mocke le contrôleur pour injecter nos scénarios
jest.mock('../../controllers/import.controllers.js', () => ({
  importCSV: jest.fn(),
}));

const { importCSV } = require('../../controllers/import.controllers.js');
const importRouter = require('../../routes/importData.routes.js');

describe('POST / (importData.routes)', () => {
  let app;

  beforeAll(() => {
    app = express();
    // pour que Express comprenne du JSON, même si on n'envoie pas de body
    app.use(express.json());
    // montez votre route sur la racine
    app.use('/', importRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('doit répondre 200 et renvoyer message + result quand importCSV réussit', async () => {
    // Arrange: mocker un succès de importCSV
    importCSV.mockResolvedValue({ success: true, count: 42 });

    // Act
    const res = await request(app).post('/').send();

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Import CSV terminé',
      success: true,
      count: 42,
    });
    expect(importCSV).toHaveBeenCalledTimes(1);
  });

  it('doit répondre 500 et renvoyer message + erreur quand importCSV échoue', async () => {
    // Arrange: mocker une erreur levée par importCSV
    importCSV.mockRejectedValue(new Error('Le CSV est mal formé'));

    // Act
    const res = await request(app).post('/').send();

    // Assert
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      message: "Erreur lors de l'import CSV",
      error: 'Le CSV est mal formé',
    });
    expect(importCSV).toHaveBeenCalledTimes(1);
  });
});
