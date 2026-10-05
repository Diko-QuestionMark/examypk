const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('No user in DB, creating admin_master...');
      const admin = await prisma.user.create({
        data: { username: 'admin_master', password: 'password', name: 'Administrator', role: 'ADMIN' }
      });
      console.log('Admin created:', admin);
    }
  } catch (e) {
    console.error('Error connecting to DB:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
