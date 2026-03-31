const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { protect } = require('../middlewares/auth.middleware');

router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);

// ADD THIS ROUTE
router.get('/me', protect, authController.getMe);

module.exports = router;