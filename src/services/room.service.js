const roomRepository = require('../repositories/room.repository');

class RoomService {
  async createRoom(roomData) {
    // Check if room with same name exists
    const existingRoom = await roomRepository.findRoomByName(roomData.name);
    if (existingRoom) {
      const error = new Error('Room with this name already exists');
      error.statusCode = 409;
      throw error;
    }
    
    return await roomRepository.createRoom(roomData);
  }

  async getAllRooms(filters, page, limit) {
    return await roomRepository.findAllRooms(filters, page, limit);
  }

  async getRoomById(id) {
    const room = await roomRepository.findRoomById(id);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    return room;
  }

  async updateRoom(id, roomData) {
    // Check if room exists
    await this.getRoomById(id);
    
    // If name is being changed, check for duplicates
    if (roomData.name) {
      const existingRoom = await roomRepository.findRoomByName(roomData.name);
      if (existingRoom && existingRoom.id !== id) {
        const error = new Error('Room with this name already exists');
        error.statusCode = 409;
        throw error;
      }
    }
    
    return await roomRepository.updateRoom(id, roomData);
  }

  async deleteRoom(id) {
    // Check if room exists
    await this.getRoomById(id);
    
    // Delete the room (repository will check for active bookings)
    return await roomRepository.deleteRoom(id);
  }

  async getRoomStats(id) {
    await this.getRoomById(id);
    return await roomRepository.getRoomStats(id);
  }
}

module.exports = new RoomService();