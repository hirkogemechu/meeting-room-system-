const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load test environment
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

beforeAll(async () => {
  console.log('🧪 Test setup starting...');
  // Ensure we're using test database
  console.log(`📊 Using database: ${process.env.DATABASE_URL}`);
});

afterAll(async () => {
  console.log('🧹 Cleaning up test data...');
  // Clean up test database
  await prisma.booking.deleteMany({}).catch(() => {});
  await prisma.room.deleteMany({}).catch(() => {});
  await prisma.user.deleteMany({}).catch(() => {});
  await prisma.$disconnect();
  console.log('✅ Test cleanup complete');
});