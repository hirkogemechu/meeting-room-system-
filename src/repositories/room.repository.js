const prisma = require('../utils/prisma');

class RoomRepository {
  async createRoom(roomData) {
    // Convert equipment array to JSON string for SQLite
    const data = {
      ...roomData,
      equipment: JSON.stringify(roomData.equipment || []),
    };

    return await prisma.room.create({ data });
  }

  async findAllRooms(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let where = {};
    if (filters.capacity) {
      where.capacity = { gte: parseInt(filters.capacity) };
    }

    const rooms = await prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Parse equipment JSON strings back to arrays
    const parsedRooms = rooms.map((room) => ({
      ...room,
      equipment: JSON.parse(room.equipment || '[]'),
    }));

    const total = await prisma.room.count({ where });

    return {
      rooms: parsedRooms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRoomById(id) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'ACTIVE' },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (room) {
      room.equipment = JSON.parse(room.equipment || '[]');
    }

    return room;
  }

  async findRoomByName(name) {
    return await prisma.room.findUnique({ where: { name } });
  }

  async updateRoom(id, roomData) {
    const data = {};
    if (roomData.name) {
      data.name = roomData.name;
    }
    if (roomData.capacity) {
      data.capacity = roomData.capacity;
    }
    if (roomData.equipment) {
      data.equipment = JSON.stringify(roomData.equipment);
    }
    return await prisma.room.update({ where: { id }, data });
  }

  async deleteRoom(id) {
    return await prisma.room.delete({ where: { id } });
  }
}

module.exports = new RoomRepository();
