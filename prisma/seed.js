const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Create Admin User
  console.log('📝 Creating admin user...');
  const adminEmail = 'admin@meetingpro.com';
  const adminPassword = 'Admin123456';
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', name: 'Super Admin' },
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN'
    }
  });
  console.log(`✅ Admin: ${adminUser.email} (${adminUser.role})`);

  // 2. Create Regular Users
  console.log('\n📝 Creating regular users...');
  const users = [
    { name: 'John Doe', email: 'john@example.com', password: 'John123456' },
    { name: 'Jane Smith', email: 'jane@example.com', password: 'Jane123456' },
    { name: 'Bob Wilson', email: 'bob@example.com', password: 'Bob123456' }
  ];

  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password: await bcrypt.hash(user.password, 10), role: 'USER' }
    });
    console.log(`✅ User: ${created.email} (${created.role})`);
  }

  // 3. Create Rooms
  console.log('\n📝 Creating meeting rooms...');
  const rooms = [
    { name: 'Executive Board Room', capacity: 20, equipment: ['4K Projector', 'Video Conferencing', 'Whiteboard', 'Sound System'] },
    { name: 'Creative Workshop', capacity: 12, equipment: ['Smart TV', 'Whiteboard', 'Standing Desks'] },
    { name: 'Focus Room', capacity: 4, equipment: ['Monitor', 'Whiteboard', 'Power Outlets'] },
    { name: 'Conference Room A', capacity: 10, equipment: ['Projector', 'TV', 'Whiteboard'] },
    { name: 'Meeting Room B', capacity: 8, equipment: ['TV', 'Whiteboard', 'Video Conferencing'] },
    { name: 'Training Room', capacity: 25, equipment: ['Projector', 'Sound System', 'Whiteboard'] }
  ];

  for (const room of rooms) {
    const created = await prisma.room.upsert({
      where: { name: room.name },
      update: { capacity: room.capacity, equipment: JSON.stringify(room.equipment) },
      create: { name: room.name, capacity: room.capacity, equipment: JSON.stringify(room.equipment) }
    });
    console.log(`✅ Room: ${created.name} (Capacity: ${created.capacity})`);
  }

  console.log('\n🎉 Database seeding completed!');
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin: admin@meetingpro.com / Admin123456');
  console.log('   User: john@example.com / John123456');
  console.log('   User: jane@example.com / Jane123456');
  console.log('   User: bob@example.com / Bob123456');
}

main().catch(e => console.error('❌ Error:', e)).finally(() => prisma.$disconnect());