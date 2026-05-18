const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../shared/middleware/auth.middleware');
const { registerValidator } = require('../../shared/middleware/validator.middleware');

router.post('/register', registerValidator, authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
