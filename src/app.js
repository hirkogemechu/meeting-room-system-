const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');

// Import middleware
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Configure helmet with relaxed CSP for web interface
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (web interface)
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Homepage / API Documentation
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Meeting Room Management System API',
    version: '1.0.0',
    status: 'running',
    description: 'A production-grade REST API for managing meeting rooms, bookings, and equipment',
    documentation: 'Use Postman or Thunder Client to interact with the API',
    webInterface: 'http://localhost:3000/web',
    baseUrl: 'http://localhost:3000',
    endpoints: {
      health: {
        method: 'GET',
        url: '/health',
        description: 'Check if server is running'
      },
      auth: {
        register: {
          method: 'POST',
          url: '/api/auth/register',
          description: 'Register a new user',
          body: {
            name: 'string (required)',
            email: 'string (required, unique)',
            password: 'string (required, min 8 chars with uppercase, lowercase, number)'
          }
        },
        login: {
          method: 'POST',
          url: '/api/auth/login',
          description: 'Login user',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          }
        },
        me: {
          method: 'GET',
          url: '/api/auth/me',
          description: 'Get current user info',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        },
        refreshToken: {
          method: 'POST',
          url: '/api/auth/refresh-token',
          description: 'Refresh access token'
        },
        logout: {
          method: 'POST',
          url: '/api/auth/logout',
          description: 'Logout user',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        }
      },
      rooms: {
        getAll: {
          method: 'GET',
          url: '/api/rooms',
          description: 'Get all rooms with filters and pagination',
          headers: {
            Authorization: 'Bearer <access_token>'
          },
          queryParams: {
            capacity: 'number (optional) - Minimum capacity',
            hasEquipment: 'string (optional) - Filter by equipment',
            search: 'string (optional) - Search by room name',
            page: 'number (optional, default: 1)',
            limit: 'number (optional, default: 10)'
          }
        },
        getById: {
          method: 'GET',
          url: '/api/rooms/:id',
          description: 'Get room by ID',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        },
        create: {
          method: 'POST',
          url: '/api/rooms',
          description: 'Create a new room (Admin only)',
          headers: {
            Authorization: 'Bearer <access_token>'
          },
          body: {
            name: 'string (required, unique)',
            capacity: 'number (required, min 1)',
            equipment: 'array of strings (optional)'
          }
        },
        update: {
          method: 'PUT',
          url: '/api/rooms/:id',
          description: 'Update room (Admin only)',
          headers: {
            Authorization: 'Bearer <access_token>'
          },
          body: {
            name: 'string (optional)',
            capacity: 'number (optional)',
            equipment: 'array of strings (optional)'
          }
        },
        delete: {
          method: 'DELETE',
          url: '/api/rooms/:id',
          description: 'Delete room (Admin only)',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        },
        stats: {
          method: 'GET',
          url: '/api/rooms/:id/stats',
          description: 'Get room statistics',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        }
      },
      bookings: {
        create: {
          method: 'POST',
          url: '/api/bookings',
          description: 'Create a booking',
          headers: {
            Authorization: 'Bearer <access_token>'
          },
          body: {
            roomId: 'string (required)',
            startTime: 'ISO datetime (required)',
            endTime: 'ISO datetime (required)'
          }
        },
        getMyBookings: {
          method: 'GET',
          url: '/api/bookings/my-bookings',
          description: 'Get current user bookings',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        },
        getById: {
          method: 'GET',
          url: '/api/bookings/:id',
          description: 'Get booking by ID',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        },
        cancel: {
          method: 'PUT',
          url: '/api/bookings/:id/cancel',
          description: 'Cancel a booking',
          headers: {
            Authorization: 'Bearer <access_token>'
          }
        },
        export: {
          method: 'GET',
          url: '/api/bookings/export',
          description: 'Export bookings (Admin only)',
          headers: {
            Authorization: 'Bearer <access_token>'
          },
          queryParams: {
            format: 'string (optional, csv or json, default: csv)'
          }
        }
      }
    },
    tools: {
      webInterface: 'http://localhost:3000/web',
      prismaStudio: 'http://localhost:5555',
      postman: 'https://www.postman.com',
      thunderClient: 'VS Code extension'
    },
    github: 'https://github.com/your-repo',
    support: 'For issues, please contact the development team',
    timestamp: new Date().toISOString()
  });
});

// Web interface route
app.get('/web', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
});
// Add this to your app.js - Enhanced Logout Function
function logout() {
    console.log('Logging out...');
    
    // Clear all session data
    token = null;
    userId = null;
    userRole = null;
    
    // Hide dashboard
    if (appSection) appSection.classList.add('hidden');
    
    // Show login section
    if (loginSection) loginSection.classList.remove('hidden');
    
    // Clear any stored data
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Reset login form to default values
    if (loginEmail) loginEmail.value = 'myuser@test.com';
    if (loginPassword) loginPassword.value = 'MyPass123';
    
    // Clear any alerts
    if (bookingAlert) bookingAlert.innerHTML = '';
    
    // Reset active tab
    currentTab = 'dashboard';
    
    // Show success message
    showAlert(loginAlert, '✅ Logged out successfully!', 'success');
    
    console.log('Logout complete');
}

// Make sure logout button is properly connected
function addEventListeners() {
    // Auth events
    if (window.loginBtn) window.loginBtn.addEventListener('click', login);
    if (window.registerBtn) window.registerBtn.addEventListener('click', register);
    
    // Logout button - important!
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log('Logout button attached');
    }
    
    if (window.bookBtn) window.bookBtn.addEventListener('click', createBooking);
    if (window.showRegisterLink) window.showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    if (window.showLoginLink) window.showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
    
    // Admin events
    if (window.exportCsvBtn) window.exportCsvBtn.addEventListener('click', () => exportBookings('csv'));
    if (window.exportJsonBtn) window.exportJsonBtn.addEventListener('click', () => exportBookings('json'));
    if (window.createRoomForm) window.createRoomForm.addEventListener('submit', (e) => { e.preventDefault(); createRoom(); });
}
// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;