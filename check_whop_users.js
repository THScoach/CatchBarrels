const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWhopUsers() {
  try {
    // Count total users
    const totalUsers = await prisma.user.count();
    
    // Count users with Whop ID
    const whopUsers = await prisma.user.count({
      where: { whopUserId: { not: null } }
    });
    
    // Get sample of Whop users
    const sampleWhopUsers = await prisma.user.findMany({
      where: { whopUserId: { not: null } },
      take: 5,
      select: {
        email: true,
        name: true,
        membershipTier: true,
        membershipStatus: true,
        createdAt: true,
      }
    });
    
    console.log('=== Database Status ===');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with Whop ID: ${whopUsers}`);
    console.log(`Users without Whop ID: ${totalUsers - whopUsers}`);
    console.log('\n=== Sample Whop Users ===');
    console.log(JSON.stringify(sampleWhopUsers, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWhopUsers();
