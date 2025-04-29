const express = require('express');
const AuthController = require('../controllers/AuthController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();


router.post('/login', AuthController.login);

router.post('/register', protect, restrictTo('admin'), AuthController.register);

router.get('/profile', protect, AuthController.getProfile);

module.exports = router;
