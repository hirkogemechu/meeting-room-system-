const roomService = require('../../../src/services/room.service');
const roomRepository = require('../../../src/repositories/room.repository');

jest.mock('../../../src/repositories/room.repository');

describe('Room Service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create room successfully', async () => {
    roomRepository.findRoomByName.mockResolvedValue(null);
    roomRepository.createRoom.mockResolvedValue({
      id: '1',
      name: 'Room A',
      capacity: 10
    });

    const result = await roomService.createRoom({
      name: 'Room A',
      capacity: 10
    });

    expect(result.name).toBe('Room A');
    expect(roomRepository.createRoom).toHaveBeenCalled();
  });

  it('should throw error if room exists', async () => {
    roomRepository.findRoomByName.mockResolvedValue({ id: '1' });

    await expect(
      roomService.createRoom({ name: 'Room A', capacity: 10 })
    ).rejects.toThrow('already exists');
  });
});
