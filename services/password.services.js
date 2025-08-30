const bcrypt = require('bcrypt');

class PasswordService {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    if (!hashedPassword) return false;
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    if (password.length < minLength) {
      return {
        isValid: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères',
      };
    }
    if (!hasUpperCase) {
      return {
        isValid: false,
        message: 'Le mot de passe doit contenir au moins une majuscule',
      };
    }
    if (!hasLowerCase) {
      return {
        isValid: false,
        message: 'Le mot de passe doit contenir au moins une minuscule',
      };
    }
    if (!hasNumbers) {
      return {
        isValid: false,
        message: 'Le mot de passe doit contenir au moins un chiffre',
      };
    }
    if (!hasNonalphas) {
      return {
        isValid: false,
        message: 'Le mot de passe doit contenir au moins un caractère spécial',
      };
    }

    return { isValid: true, message: 'Mot de passe valide' };
  }
}

module.exports = PasswordService;
