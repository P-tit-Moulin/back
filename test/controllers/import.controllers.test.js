const fs = require('fs');
const { PassThrough } = require('stream');
const Producer = require('../../entity/producer.entity');
const { importCSV } = require('../../controllers/import.controllers.js');

jest.mock('fs');
jest.mock('../../entity/producer.entity');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2'),
}));

describe('importCSV – test unitaire', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait parser le CSV et appeler Producer.insertMany avec les bons objets', async () => {
    // CSV factice à 2 lignes + en-tête
    const csvData = `Nom;Adresse;Géolocalisation;Nom Officiel Commune;Code Postal;Description;Familles des produits;familles_des_produits_restreintes
Prod1;Addr1;48.85,2.35;Paris;75000;Desc1;foo&bar;res1&res2
Prod2;Addr2;;Commune2;;Desc2;;`;

    // on mocke le stream de lecture
    const fakeStream = new PassThrough();
    fs.createReadStream.mockReturnValue(fakeStream);

    // on mocke insertMany
    Producer.insertMany.mockResolvedValue([
      {
        /* docs retournés */
      },
    ]);

    // on démarre l’import
    const importPromise = importCSV();

    // on envoie les données
    fakeStream.end(csvData);

    // on attend la fin
    const result = await importPromise;

    // vérifications
    expect(Producer.insertMany).toHaveBeenCalledTimes(1);
    const docs = Producer.insertMany.mock.calls[0][0];
    expect(docs).toHaveLength(2);

    // premier producer correctement transformé
    expect(docs[0]).toMatchObject({
      id: 'uuid-1',
      nom: 'Prod1',
      adresse: 'Addr1',
      com_name: 'Paris',
      code_postal: 75000,
      description: 'Desc1',
      familles_des_produits: ['foo', 'bar'],
      // géolocalisation inversée [lon, lat]
      geometry: { type: 'Point', coordinates: [2.35, 48.85] },
    });

    // deuxième producer avec valeurs par défaut
    expect(docs[1]).toMatchObject({
      id: 'uuid-2',
      nom: 'Prod2',
      adresse: 'Addr2',
      com_name: 'Commune2',
      code_postal: null,
      description: 'Desc2',
      familles_des_produits: [],
      geometry: { type: 'Point', coordinates: [0, 0] },
    });

    expect(result).toEqual({ success: true, count: 2 });
  });
});
