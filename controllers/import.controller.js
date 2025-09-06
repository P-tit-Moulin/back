const ImportService = require('../services/import_data.services');

exports.importCSV = async (req, res) => {
  try {
    const result = await ImportService.importCSV();
    res.status(200).json({ message: 'Import CSV terminé', ...result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'import CSV", error: error.message });
  }
};
