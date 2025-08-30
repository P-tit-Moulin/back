const express = require('express');
const UserController = require('../controllers/user.controllers');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../middleware/validators');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateCreateUser, UserController.createUser);
router.post('/login', UserController.loginUser);

router.use(authMiddleware);

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validateUpdateUser, UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
