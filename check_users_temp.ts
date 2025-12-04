import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      name: true,
      isCoach: true,
      role: true,
    }
  });
  console.log('=== Users in database ===');
  users.forEach(user => {
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`IsCoach: ${user.isCoach || false}`);
    console.log(`Role: ${user.role || 'player'}`);
    console.log('---');
  });
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
