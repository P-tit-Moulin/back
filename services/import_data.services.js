const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Producer = require('../entity/producer.entity');
const { v4: uuidv4 } = require('uuid');

async function importCSV() {
  return new Promise((resolve, reject) => {
    const rawRows = [];

    fs.createReadStream(path.join(__dirname, '../data/producers.csv'))
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => rawRows.push(data))
      .on('end', async () => {
        try {
          const allDocs = rawRows.map((item) => {
            const [latitude, longitude] = item['Géolocalisation']
              ? item['Géolocalisation'].split(',').map(Number)
              : [0, 0];
            return {
              id: uuidv4(),
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              nom: item.Nom,
              adresse: item.Adresse,
              com_name: item['Nom Officiel Commune'],
              code_postal: item['Code Postal']
                ? Number(item['Code Postal'])
                : null,
              description: item.Description,
              familles_des_produits: item['Familles des produits']
                ? item['Familles des produits'].split('&').map((s) => s.trim())
                : [],
              familles_des_produits_restreintes: item[
                'familles_des_produits_restreintes'
              ]
                ? item['familles_des_produits_restreintes']
                    .split(';')
                    .map((s) => s.trim())
                : [],
            };
          });

          const byName = new Map();
          allDocs.forEach((doc) => {
            if (doc.nom) {
              byName.set(doc.nom, doc);
            }
          });
          const uniqueDocs = Array.from(byName.values());

          const bulkOps = uniqueDocs.map((doc) => ({
            updateOne: {
              filter: { nom: doc.nom },
              update: { $set: doc },
              upsert: true,
            },
          }));

          const result = await Producer.bulkWrite(bulkOps, { ordered: false });

          resolve({
            success: true,
            processed: uniqueDocs.length,
            upserted: result.upsertedCount,
            updated: result.modifiedCount,
          });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

module.exports = { importCSV };
