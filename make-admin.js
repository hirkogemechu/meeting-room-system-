const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'admin@meetingpro.com' }
    });

    if (!user) {
      console.log('User not found! Please register first.');
      console.log('Run: curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Super Admin\",\"email\":\"admin@meetingpro.com\",\"password\":\"Admin123456\"}"');
      return;
    }

    // Update user role to ADMIN
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });

    console.log('✅ User updated successfully!');
    console.log(`   Name: ${updated.name}`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role: ${updated.role}`);
    console.log('\nYou can now login with:');
    console.log('   Email: admin@meetingpro.com');
    console.log('   Password: Admin123456');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();