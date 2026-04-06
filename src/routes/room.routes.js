const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const roomController = require('../controllers/room.controller');

// All room routes require authentication
router.get('/', protect, roomController.getAllRooms);
router.get('/:id', protect, roomController.getRoomById);
router.post('/', protect, adminOnly, roomController.createRoom);
router.put('/:id', protect, adminOnly, roomController.updateRoom);
router.delete('/:id', protect, adminOnly, roomController.deleteRoom);

module.exports = router;