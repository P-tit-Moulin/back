const Joi = require('joi');
const xss = require('xss');

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input.trim());
  }
  return input;
};

const createUserSchema = Joi.object({
  prenom: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes',
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
      'any.required': 'Le prénom est obligatoire',
    }),

  nom_de_famille: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Le nom de famille ne peut contenir que des lettres, espaces, tirets et apostrophes',
      'string.min': 'Le nom de famille doit contenir au moins 2 caractères',
      'string.max': 'Le nom de famille ne peut pas dépasser 50 caractères',
      'any.required': 'Le nom de famille est obligatoire',
    }),

  email: Joi.string().email().lowercase().required().messages({
    'string.email': "Format d'email invalide",
    'any.required': "L'email est obligatoire",
  }),

  mdp: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base':
        'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'any.required': 'Le mot de passe est obligatoire',
    }),

  role: Joi.string().valid('user', 'admin').default('user'),

  adresse: Joi.string().max(200).allow(''),
  com_name: Joi.string().max(100).allow(''),
  code_postal: Joi.number().integer().min(10000).max(99999),
  description: Joi.string().max(1000).allow(''),
  familles_des_produits: Joi.array().items(Joi.string()),
  familles_des_produits_restreintes: Joi.array().items(Joi.string()),
  coordinates: Joi.array().items(Joi.number()).length(2),
});

const updateUserSchema = Joi.object({
  prenom: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .messages({
      'string.pattern.base':
        'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes',
    }),

  nom_de_famille: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .messages({
      'string.pattern.base':
        'Le nom de famille ne peut contenir que des lettres, espaces, tirets et apostrophes',
    }),

  email: Joi.string().email().lowercase().messages({
    'string.email': "Format d'email invalide",
  }),

  mdp: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.pattern.base':
        'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
    }),

  role: Joi.string().valid('user', 'admin'),

  adresse: Joi.string().max(200).allow(''),
  com_name: Joi.string().max(100).allow(''),
  code_postal: Joi.number().integer().min(10000).max(99999),
  description: Joi.string().max(1000).allow(''),
  familles_des_produits: Joi.array().items(Joi.string()),
  familles_des_produits_restreintes: Joi.array().items(Joi.string()),
  coordinates: Joi.array().items(Joi.number()).length(2),
}).min(1);

const validateUser = (schema) => {
  return (req, res, next) => {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        error: 'Données invalides',
        details: errorMessages,
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateCreateUser: validateUser(createUserSchema),
  validateUpdateUser: validateUser(updateUserSchema),
  sanitizeInput,
};
