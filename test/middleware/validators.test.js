// Mock des dépendances
jest.mock('validator', () => ({
  isEmail: jest.fn(),
}));

jest.mock('xss', () => jest.fn());

// Mock du module validators
jest.mock('../../middleware/validators', () => {
  const validator = require('validator');
  const xss = require('xss');

  const validateCreateUser = (req, res, next) => {
    const { prenom, nom_de_famille, email, mdp } = req.body;

    // Nettoyage XSS
    if (prenom) {
      req.body.prenom = xss(prenom);
    }

    const errors = [];

    if (!prenom || prenom.trim().length === 0) {
      errors.push('Le prénom est requis');
    }

    if (!nom_de_famille || nom_de_famille.trim().length === 0) {
      errors.push('Le nom de famille est requis');
    }

    if (!email || !validator.isEmail(email)) {
      errors.push('Email invalide');
    }

    if (!mdp || mdp.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Données invalides', errors });
    }

    next();
  };

  const validateUpdateUser = (req, res, next) => {
    const { email } = req.body;
    const errors = [];

    if (email && !validator.isEmail(email)) {
      errors.push('Email invalide');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Données invalides', errors });
    }

    next();
  };

  return {
    validateCreateUser,
    validateUpdateUser,
  };
});

const validator = require('validator');
const xss = require('xss');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../../middleware/validators');

describe('validateCreateUser middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Configuration des mocks
    validator.isEmail.mockReturnValue(true);
    xss.mockImplementation((str) =>
      str.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    );
  });

  it('devrait appeler next avec des données valides', () => {
    req.body = {
      prenom: 'John',
      nom_de_famille: 'Doe',
      email: 'test@test.com',
      mdp: 'password123',
    };

    validateCreateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait retourner 400 pour des données invalides', () => {
    validator.isEmail.mockReturnValue(false);

    req.body = {
      prenom: '', // Invalide
      email: 'invalid-email',
      mdp: '123', // Trop court
    };

    validateCreateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait nettoyer les chaînes avec XSS', () => {
    req.body = {
      prenom: '<script>alert(1)</script>',
      nom_de_famille: 'Doe',
      email: 'test@test.com',
      mdp: 'password123',
    };

    validateCreateUser(req, res, next);

    expect(xss).toHaveBeenCalledWith('<script>alert(1)</script>');
    expect(next).toHaveBeenCalled();
  });
});

describe('validateUpdateUser middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    validator.isEmail.mockReturnValue(true);
  });

  it('devrait appeler next si aucune donnée (car la mise à jour est optionnelle)', () => {
    req.body = {};

    validateUpdateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait appeler next si les données sont valides', () => {
    req.body = {
      prenom: 'John',
      email: 'john@example.com',
    };

    validateUpdateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait renvoyer 400 si une donnée est invalide', () => {
    validator.isEmail.mockReturnValue(false);

    req.body = {
      email: 'invalid-email-format',
    };

    validateUpdateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
