const express = require('express');
const AuthController = require('../controllers/AuthController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();


router.post('/login', AuthController.login);

// Registro público deshabilitado
// router.post('/register', AuthController.register);

router.get('/profile', protect, AuthController.getProfile);

module.exports = router;
