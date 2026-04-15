const authService = require('../../../src/services/auth.service');
const userRepo = require('../../../src/repositories/user.repository');
const bcrypt = require('bcryptjs');

jest.mock('../../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fail if user not found', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'x@test.com', password: '123' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should fail if password incorrect', async () => {
    userRepo.findByEmail.mockResolvedValue({
      password: 'hashed'
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({ email: 'x@test.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });
});
