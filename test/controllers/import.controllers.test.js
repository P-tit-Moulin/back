const ImportService = require('../../services/import_data.services');
const { importCSV } = require('../../controllers/import.controller');

// On mocke le service
jest.mock('../../services/import_data.services');

describe('ImportController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('importCSV', () => {
    it("devrait renvoyer 200 et un message si l'import est réussi", async () => {
      const fakeResult = { imported: 10, skipped: 2 };
      ImportService.importCSV.mockResolvedValue(fakeResult);

      await importCSV(req, res);

      expect(ImportService.importCSV).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Import CSV terminé',
        ...fakeResult,
      });
    });

    it("devrait renvoyer 500 et un message d'erreur si le service échoue", async () => {
      ImportService.importCSV.mockRejectedValue(
        new Error('Erreur parsing CSV'),
      );

      await importCSV(req, res);

      expect(ImportService.importCSV).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de l'import CSV",
        error: 'Erreur parsing CSV',
      });
    });
  });
});
