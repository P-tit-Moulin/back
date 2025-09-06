const jwt = require('jsonwebtoken');

class JWTService {
  static accessSecret =
    process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
  static refreshSecret =
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  static accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
  static refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  static generateAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
      issuer: 'ptit-moulin-api',
      audience: 'ptit-moulin-users',
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
      issuer: 'ptit-moulin-api',
      audience: 'ptit-moulin-users',
    });
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, this.accessSecret, {
      issuer: 'ptit-moulin-api',
      audience: 'ptit-moulin-users',
    });
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshSecret, {
      issuer: 'ptit-moulin-api',
      audience: 'ptit-moulin-users',
    });
  }
}

module.exports = JWTService;
