const roomService = require('../services/room.service');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const room = await roomService.createRoom(req.body);
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRooms(req, res, next) {
    try {
      const { capacity, page = 1, limit = 10 } = req.query;
      const result = await roomService.getAllRooms({ capacity }, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result.rooms,
        pagination: {
          page: result.page,
          limit: parseInt(limit),
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req, res, next) {
    try {
      const room = await roomService.getRoomById(req.params.id);
      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const room = await roomService.updateRoom(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req, res, next) {
    try {
      await roomService.deleteRoom(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Room deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
