const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// ADMIN ROUTES - User Management
router.get('/users', protect, adminOnly, authController.getAllUsers);
router.get('/users/stats', protect, adminOnly, authController.getUserStats);
router.get('/users/:id', protect, adminOnly, authController.getUserById);
router.put('/users/:id/role', protect, adminOnly, authController.updateUserRole);
router.delete('/users/:id', protect, adminOnly, authController.deleteUser);

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error
 */
router.post('/register', validate(registerSchema), authController.register);
module.exports = router;
