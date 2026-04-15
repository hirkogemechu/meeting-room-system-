// =====================
// ENV FIRST
// =====================
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';

// =====================
// SILENCE LOGS
// =====================
global.console.log = jest.fn();
global.console.error = jest.fn();

// =====================
// IMPORTANT: DO NOT USE FAKE TIMERS
// =====================
// ❌ REMOVE THIS:
// jest.useFakeTimers();

// =====================
// SET TIMEOUT
// =====================
jest.setTimeout(30000);

// =====================
// MOCK NODEMAILER (SAFE)
// =====================
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-id',
    }),
    close: jest.fn().mockResolvedValue(true),
  })),
  getTestMessageUrl: jest.fn(() => 'http://preview.email'),
}));

// =====================
// MOCK PDF WORKER (SAFE)
// =====================
jest.mock('../../src/workers/pdfWorker', () => ({
  generatePDF: jest.fn().mockResolvedValue('fake.pdf'),
}));

// =====================
// GLOBAL CLEANUP (REAL FIX)
// =====================
afterAll(async () => {
  jest.clearAllMocks();

  // let event loop finish pending async tasks
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));
});
