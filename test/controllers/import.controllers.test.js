const fs = require('fs');
const { PassThrough } = require('stream');
const Producer = require('../../entity/producer.entity');
const { importCSV } = require('../../controllers/import.controllers.js');

jest.mock('fs');
jest.mock('../../entity/producer.entity');
jest.mock('uuid', () => ({
  v4: jest
    .fn()
    .mockReturnValueOnce('uuid-1')
    .mockReturnValueOnce('uuid-2')
    .mockReturnValueOnce('uuid-3'),
}));

describe('importCSV – test unitaire', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('doit parser le CSV, supprimer les doublons de nom, et appeler Producer.bulkWrite avec les bons objets', async () => {
    const csvData = `Nom;Adresse;Géolocalisation;Nom Officiel Commune;Code Postal;Description;Familles des produits;familles_des_produits_restreintes
Prod1;Addr1;48.85,2.35;Paris;75000;Desc1;foo&bar;res1&res2
Prod2;Addr2;;Commune2;;Desc2;;
Prod1;Addr3;40.00,3.00;Lyon;69000;Desc3;baz;res3`;

    const fakeStream = new PassThrough();
    fs.createReadStream.mockReturnValue(fakeStream);

    Producer.bulkWrite.mockResolvedValue({
      upsertedCount: 2,
      modifiedCount: 0,
    });

    const importPromise = importCSV();

    fakeStream.end(csvData);

    const result = await importPromise;

    const bulkOps = Producer.bulkWrite.mock.calls[0][0];
    expect(bulkOps).toHaveLength(2);

    expect(bulkOps[0].updateOne.filter.nom).toBe('Prod1');
    expect(bulkOps[1].updateOne.filter.nom).toBe('Prod2');
    expect(bulkOps[0].updateOne.update.$set.nom).toBe('Prod1');
    expect(bulkOps[1].updateOne.update.$set.nom).toBe('Prod2');

    expect(result).toEqual({
      success: true,
      processed: 2,
      upserted: 2,
      updated: 0,
    });
  });

  it('doit gérer les erreurs de lecture du fichier', async () => {
    fs.createReadStream.mockImplementation(() => {
      throw new Error('Erreur lecture');
    });

    await expect(importCSV()).rejects.toThrow('Erreur lecture');
  });

  it('doit gérer les erreurs du bulkWrite', async () => {
    const csvData = `Nom;Adresse;Géolocalisation
Prod1;Addr1;48.85,2.35`;

    const fakeStream = new PassThrough();
    fs.createReadStream.mockReturnValue(fakeStream);

    Producer.bulkWrite.mockRejectedValue(new Error('Erreur BDD'));

    const importPromise = importCSV();
    fakeStream.end(csvData);

    await expect(importPromise).rejects.toThrow('Erreur BDD');
  });
});
