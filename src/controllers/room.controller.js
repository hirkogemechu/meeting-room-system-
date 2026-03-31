const roomService = require('../services/room.service');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const room = await roomService.createRoom(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRooms(req, res, next) {
    try {
      const { capacity, hasEquipment, search, page = 1, limit = 10 } = req.query;
      
      const filters = { capacity, hasEquipment, search };
      const result = await roomService.getAllRooms(filters, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.rooms,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
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
        data: room
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
        data: room
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
        message: 'Room deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomStats(req, res, next) {
    try {
      const stats = await roomService.getRoomStats(req.params.id);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();