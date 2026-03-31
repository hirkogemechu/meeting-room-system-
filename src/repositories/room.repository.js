const prisma = require('../utils/prisma');

class RoomRepository {
  async createRoom(roomData) {
    return await prisma.room.create({
      data: {
        name: roomData.name,
        capacity: roomData.capacity,
        equipment: roomData.equipment || []
      }
    });
  }

  async findAllRooms(filters = {}, page = 1, limit = 10) {
    const { capacity, hasEquipment, search } = filters;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let where = {};
    
    if (capacity) {
      where.capacity = { gte: parseInt(capacity) };
    }
    
    if (hasEquipment) {
      // Check if equipment array contains the specified equipment
      where.equipment = { 
        array_contains: hasEquipment 
      };
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          bookings: {
            where: {
              status: 'ACTIVE',
              startTime: { gte: new Date() }
            },
            take: 5
          }
        }
      }),
      prisma.room.count({ where })
    ]);
    
    return {
      rooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findRoomById(id) {
    return await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'ACTIVE' },
          orderBy: { startTime: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async findRoomByName(name) {
    return await prisma.room.findUnique({
      where: { name }
    });
  }

  async updateRoom(id, roomData) {
    return await prisma.room.update({
      where: { id },
      data: {
        name: roomData.name,
        capacity: roomData.capacity,
        equipment: roomData.equipment
      }
    });
  }

  async deleteRoom(id) {
    // Check if room has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        roomId: id,
        status: 'ACTIVE',
        startTime: { gt: new Date() }
      }
    });
    
    if (activeBookings) {
      throw new Error('Cannot delete room with active bookings');
    }
    
    return await prisma.room.delete({
      where: { id }
    });
  }

  async getRoomStats(id) {
    const stats = await prisma.booking.aggregate({
      where: { roomId: id },
      _count: true,
      _avg: { 
        // You can add more aggregations here
      }
    });
    
    return {
      totalBookings: stats._count
    };
  }
}

module.exports = new RoomRepository();