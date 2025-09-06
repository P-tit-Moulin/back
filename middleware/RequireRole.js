function requireRole(...allowedRoles) {
  return function (req, res, next) {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error:
          allowedRoles.length > 1
            ? `Accès refusé. Ce service est réservé aux rôles: ${allowedRoles.join(', ')}.`
            : `Accès refusé. Ce service est réservé au rôle: ${allowedRoles[0]}.`,
      });
    }
    next();
  };
}

module.exports = requireRole;
