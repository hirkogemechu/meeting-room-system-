const { PrismaClient } = require('@prisma/client');

// Create a single PrismaClient instance to be used across the app
const prisma = new PrismaClient();

module.exports = prisma;