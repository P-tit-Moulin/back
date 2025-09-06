const express = require('express');

const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/RequireRole');
const requireAuth = require('../middleware/auth');
const isOwnerOrAdmin = require('../middleware/isOwnerOrAdmin');

const UserController = require('../controllers/user.controller');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../middleware/validators');

const router = express.Router();

router.post('/register', validateCreateUser, UserController.createUser);
router.post('/login', UserController.loginUser);

router.use(authMiddleware);

router.get('/', requireAuth, requireRole('admin'), UserController.getAllUsers);
router.get('/:id', requireAuth, UserController.getUserById);
router.put(
  '/:id',
  requireAuth,
  isOwnerOrAdmin,
  validateUpdateUser,
  UserController.updateUser,
);
router.delete('/:id', requireAuth, isOwnerOrAdmin, UserController.deleteUser);

module.exports = router;
