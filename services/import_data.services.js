const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Producer = require('../entity/producer.entity');

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
              // Retiré le champ id manuel - MongoDB utilisera _id automatiquement
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

          // Filtrer les documents avec un nom valide
          const validDocs = allDocs.filter(
            (doc) => doc.nom && doc.nom.trim() !== '',
          );

          // Dédoublonnage par nom
          const byName = new Map();
          validDocs.forEach((doc) => {
            byName.set(doc.nom, doc);
          });
          const uniqueDocs = Array.from(byName.values());

          console.log(`Processing ${uniqueDocs.length} unique documents`);

          if (uniqueDocs.length === 0) {
            resolve({
              success: true,
              processed: 0,
              upserted: 0,
              updated: 0,
              message: 'Aucun document valide à traiter',
            });
            return;
          }

          const bulkOps = uniqueDocs.map((doc) => ({
            updateOne: {
              filter: { nom: doc.nom },
              update: { $set: doc },
              upsert: true,
            },
          }));

          const result = await Producer.bulkWrite(bulkOps, { ordered: false });

          console.log('Bulk write result:', result);

          resolve({
            success: true,
            processed: uniqueDocs.length,
            upserted: result.upsertedCount || 0,
            updated: result.modifiedCount || 0,
            matched: result.matchedCount || 0,
          });
        } catch (err) {
          console.error('Erreur lors du traitement:', err);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('Erreur lors de la lecture du fichier CSV:', err);
        reject(err);
      });
  });
}

module.exports = { importCSV };
