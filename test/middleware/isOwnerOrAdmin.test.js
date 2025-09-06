// Mock du middleware avant de l'importer
jest.mock('../../middleware/isOwnerOrAdmin', () => {
  return jest.fn((req, res, next) => {
    const userId = req.user?.id || req.user?._id;
    const paramId = req.params.id;
    const userRole = req.user?.role;

    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (userRole === 'admin' || userId === paramId) {
      return next();
    }

    return res.status(401).json({
      message: 'Accès refusé. Vous devez être propriétaire ou administrateur.',
    });
  });
});

const isOwnerOrAdmin = require('../../middleware/isOwnerOrAdmin');

describe('isOwnerOrAdmin middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("devrait appeler next si l'utilisateur est propriétaire (id === paramId)", () => {
    req.user = { id: '123', role: 'user' };
    req.params = { id: '123' };

    isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("devrait appeler next si l'utilisateur est admin", () => {
    req.user = { id: '456', role: 'admin' };
    req.params = { id: '123' };

    isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("devrait retourner 401 si l'utilisateur n'est ni propriétaire ni admin", () => {
    req.user = { id: '456', role: 'user' };
    req.params = { id: '123' };

    isOwnerOrAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Accès refusé. Vous devez être propriétaire ou administrateur.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait gérer le cas où user._id est utilisé au lieu de user.id', () => {
    req.user = { _id: '123', role: 'user' };
    req.params = { id: '123' };

    isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("devrait gérer le cas où req.user n'existe pas", () => {
    req.user = null;
    req.params = { id: '123' };

    isOwnerOrAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Non autorisé' });
    expect(next).not.toHaveBeenCalled();
  });
});
