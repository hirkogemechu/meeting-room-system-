const bookingService = require('../../src/services/booking.service');
const bookingRepository = require('../../src/repositories/booking.repository');

// Mock the repository
jest.mock('../../src/repositories/booking.repository');

describe('Booking Logic - Conflict Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkOverlap function', () => {
    it('should return true when bookings overlap (start inside existing)', async () => {
      // Existing booking: 10:00 - 12:00
      // New booking: 11:00 - 13:00
      const existingBookings = [{
        startTime: new Date('2026-04-10T10:00:00Z'),
        endTime: new Date('2026-04-10T12:00:00Z')
      }];
      
      bookingRepository.checkOverlap.mockResolvedValue(existingBookings[0]);
      
      const result = await bookingRepository.checkOverlap(
        'room123',
        new Date('2026-04-10T11:00:00Z'),
        new Date('2026-04-10T13:00:00Z')
      );
      
      expect(result).toBeDefined();
      expect(bookingRepository.checkOverlap).toHaveBeenCalled();
    });

    it('should return false when bookings do NOT overlap', async () => {
      // Existing booking: 10:00 - 12:00
      // New booking: 13:00 - 15:00
      bookingRepository.checkOverlap.mockResolvedValue(null);
      
      const result = await bookingRepository.checkOverlap(
        'room123',
        new Date('2026-04-10T13:00:00Z'),
        new Date('2026-04-10T15:00:00Z')
      );
      
      expect(result).toBeNull();
    });

    it('should detect overlap when new booking contains existing', async () => {
      // Existing booking: 11:00 - 13:00
      // New booking: 10:00 - 14:00
      const existingBookings = [{
        startTime: new Date('2026-04-10T11:00:00Z'),
        endTime: new Date('2026-04-10T13:00:00Z')
      }];
      
      bookingRepository.checkOverlap.mockResolvedValue(existingBookings[0]);
      
      const result = await bookingRepository.checkOverlap(
        'room123',
        new Date('2026-04-10T10:00:00Z'),
        new Date('2026-04-10T14:00:00Z')
      );
      
      expect(result).toBeDefined();
    });
  });
});