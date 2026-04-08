const z = require('zod');

const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name must be less than 100 characters'),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must be less than 1000'),
  equipment: z.array(z.string()).optional().default([]),
});

const updateRoomSchema = z.object({
  name: z
    .string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name must be less than 100 characters')
    .optional(),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must be less than 1000')
    .optional(),
  equipment: z.array(z.string()).optional(),
});

const roomFiltersSchema = z.object({
  capacity: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  hasEquipment: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
});

module.exports = {
  createRoomSchema,
  updateRoomSchema,
  roomFiltersSchema,
};
