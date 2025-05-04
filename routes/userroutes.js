const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const auth = require('../middleware/authmiddleware');

// Register user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Get current user
router.get('/me', auth, userController.getMe);

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router;