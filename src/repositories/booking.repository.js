const prisma = require('../utils/prisma');

class BookingRepository {
  async createBooking(bookingData) {
    return await prisma.booking.create({
      data: {
        userId: bookingData.userId,
        roomId: bookingData.roomId,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        status: 'ACTIVE',
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async checkOverlap(roomId, startTime, endTime, excludeBookingId = null) {
    // Convert to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Build the where condition
    const whereCondition = {
      roomId: roomId,
      status: 'ACTIVE',
      OR: [
        {
          // Booking that starts during the new booking
          startTime: { lte: start },
          endTime: { gt: start },
        },
        {
          // Booking that ends during the new booking
          startTime: { lt: end },
          endTime: { gte: end },
        },
        {
          // Booking that completely contains the new booking
          startTime: { gte: start },
          endTime: { lte: end },
        },
      ],
    };

    // If updating, exclude the current booking
    if (excludeBookingId) {
      whereCondition.id = { not: excludeBookingId };
    }

    const overlapping = await prisma.booking.findFirst({
      where: whereCondition,
    });

    return overlapping;
  }

  async findUserBookings(userId, page = 1, limit = 10, status = null) {
    const skip = (page - 1) * limit;

    let where = { userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              capacity: true,
              equipment: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllBookings(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    let where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.roomId) {
      where.roomId = filters.roomId;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.startDate) {
      where.startTime = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.endTime = { lte: new Date(filters.endDate) };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              capacity: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBookingById(id) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: true,
      },
    });
  }

  async cancelBooking(id) {
    return await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getUserUpcomingBookings(userId) {
    return await prisma.booking.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        startTime: { gt: new Date() },
      },
      orderBy: { startTime: 'asc' },
      include: {
        room: true,
      },
    });
  }
}

module.exports = new BookingRepository();
