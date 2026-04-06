const authService = require('../services/auth.service');
const prisma = require('../utils/prisma');

class AuthController {
  // ==================== AUTHENTICATION METHODS ====================
  
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided',
          statusCode: 401
        });
      }

      const tokens = await authService.refreshTokens(refreshToken);
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER MANAGEMENT METHODS (ADMIN ONLY) ====================

  // Get all users
  async getAllUsers(req, res, next) {
    try {
      console.log('📡 getAllUsers called by admin:', req.user?.email);
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`✅ Found ${users.length} users`);
      
      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error);
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          bookings: {
            include: { room: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          statusCode: 404
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user role
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['USER', 'ADMIN'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be USER or ADMIN',
          statusCode: 400
        });
      }
      
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          statusCode: 404
        });
      }
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true
        }
      });
      
      res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          statusCode: 404
        });
      }
      
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
          statusCode: 400
        });
      }
      
      await prisma.user.delete({ where: { id } });
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  async getUserStats(req, res, next) {
    try {
      const totalUsers = await prisma.user.count();
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const userCount = await prisma.user.count({ where: { role: 'USER' } });
      
      res.status(200).json({
        success: true,
        data: {
          total: totalUsers,
          admins: adminCount,
          users: userCount
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();