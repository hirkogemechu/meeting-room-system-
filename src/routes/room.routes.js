const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createRoomSchema, updateRoomSchema, roomFiltersSchema } = require('../validations/room.validation');
const roomController = require('../controllers/room.controller');

// Public routes (but still require authentication)
router.get('/', protect, roomController.getAllRooms);
router.get('/:id', protect, roomController.getRoomById);
router.get('/:id/stats', protect, roomController.getRoomStats);

// Admin only routes
router.post('/', protect, adminOnly, validate(createRoomSchema), roomController.createRoom);
router.put('/:id', protect, adminOnly, validate(updateRoomSchema), roomController.updateRoom);
router.delete('/:id', protect, adminOnly, roomController.deleteRoom);

module.exports = router;