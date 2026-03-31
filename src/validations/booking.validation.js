const z = require('zod');

const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  startTime: z.string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), {
      message: 'Start time must be in the future'
    }),
  endTime: z.string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), {
      message: 'End time must be in the future'
    })
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime']
});

const bookingFiltersSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']).optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
});

module.exports = {
  createBookingSchema,
  bookingFiltersSchema
};