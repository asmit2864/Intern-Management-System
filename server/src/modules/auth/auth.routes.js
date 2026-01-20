const express = require('express');
const authController = require('./auth.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);

// Admin only routes
router.patch('/users/:id/reset-password', protect, authorize('admin'), authController.resetPassword);

module.exports = router;
