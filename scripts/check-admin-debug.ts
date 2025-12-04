import { config } from 'dotenv';
import { prisma } from '../lib/db';

// Load environment variables
config();

async function checkAdmin() {
  try {
    console.log('🔍 Checking for admin users...\n');
    
    // Check for coach@catchbarrels.app by username (unique field)
    const coachUser = await prisma.user.findUnique({
      where: { username: 'coach@catchbarrels.app' }
    });
    
    if (coachUser) {
      console.log('✅ Found coach@catchbarrels.app (by username):');
      console.log('   ID:', coachUser.id);
      console.log('   Name:', coachUser.name);
      console.log('   Email:', coachUser.email);
      console.log('   Username:', coachUser.username);
      console.log('   Role:', coachUser.role);
      console.log('   Has password:', !!coachUser.password);
      console.log('   Password hash (first 20 chars):', coachUser.password?.substring(0, 20) + '...');
    } else {
      console.log('❌ coach@catchbarrels.app NOT FOUND (checked username field)');
    }
    
    console.log('\n---\n');
    
    // Check all admin/coach users
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { role: 'coach' }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true
      }
    });
    
    console.log(`Found ${adminUsers.length} admin/coach users:`);
    adminUsers.forEach(u => {
      console.log(`  - ${u.email} (username: ${u.username}, role: ${u.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
