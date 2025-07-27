const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Producer = require('../entity/producer.entity');
const { v4: uuidv4 } = require('uuid');

async function importCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(path.join(__dirname, '../data/producers.csv'))
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const docs = results.map((item) => {
            const [latitude, longitude] = item['Géolocalisation']
              ? item['Géolocalisation'].split(',').map(Number)
              : [0, 0];
            return {
              id: uuidv4(),
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              categorie: item['Catégorie'],
              nom: item.Nom,
              adresse: item.Adresse,
              com_name: item['Nom Officiel Commune'],
              code_postal: item['Code Postal'] ? Number(item['Code Postal']) : null,
              description: item.Description,
              familles_des_produits: item['Familles des produits']
                ? item['Familles des produits'].split('&').map((s) => s.trim())
                : [],
              familles_des_produits_restreintes: item.familles_des_produits_restreintes
                ? item.familles_des_produits_restreintes.split(';').map((s) => s.trim())
                : [],
            };
          });

          await Producer.insertMany(docs);

          console.log(`✅ ${results.length} producteurs importés/mis à jour depuis CSV.`);
          resolve({ success: true, count: results.length });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = { importCSV };
