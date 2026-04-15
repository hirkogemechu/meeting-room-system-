jest.mock('../../../src/repositories/room.repository', () => ({
  findRoomById: jest.fn(),
}));

jest.mock('../../../src/repositories/booking.repository', () => ({
  checkOverlap: jest.fn(),
  createBooking: jest.fn(),
}));

jest.mock('../../../src/services/pdf.service', () => ({
  generateBookingReceipt: jest.fn().mockResolvedValue('receipt.pdf'),
}));

const roomRepository = require('../../../src/repositories/room.repository');
const bookingRepository = require('../../../src/repositories/booking.repository');
const PDFService = require('../../../src/services/pdf.service');
const bookingService = require('../../../src/services/booking.service');

describe('Booking Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should allow valid booking', async () => {
    const mockData = {
      roomId: 'room123',
      startTime: new Date('2026-04-10T10:00:00Z'),
      endTime: new Date('2026-04-10T11:00:00Z'),
    };

    roomRepository.findRoomById.mockResolvedValue({
      id: 'room123',
      name: 'Room A',
    });

    bookingRepository.checkOverlap.mockResolvedValue(null);

    bookingRepository.createBooking.mockResolvedValue({
      id: 'booking123',
      ...mockData,
    });

    const result = await bookingService.createBooking('user123', mockData);

    expect(result).toBeDefined();
    expect(result.id).toBe('booking123');
    expect(roomRepository.findRoomById).toHaveBeenCalled();
    expect(bookingRepository.createBooking).toHaveBeenCalled();
  });
});
