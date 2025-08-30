const Producer = require('../entity/producer.entity');
const JWTService = require('../services/jwt.services');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (!token) return res.status(401).json({ error: 'Token manquant.' });

    const decoded = JWTService.verifyAccessToken(token);
    const user = await Producer.findOne({
      _id: decoded.userId,
      isUserAccount: true,
    }).select('-mdp');
    if (!user)
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message || 'Token invalide.' });
  }
};

module.exports = { authMiddleware };
