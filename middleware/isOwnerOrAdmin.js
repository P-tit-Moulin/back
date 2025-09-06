function isOwnerOrAdmin(req, res, next) {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const paramId = req.params.id;

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié.' });
  }

  if (userRole === 'admin') {
    return next();
  }

  if (userId === paramId || req.user?.id === paramId) {
    return next();
  }

  return res.status(403).json({
    error: "Accès interdit : vous n'êtes ni propriétaire ni administrateur.",
  });
}

module.exports = isOwnerOrAdmin;
