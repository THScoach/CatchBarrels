/**
 * Admin User Seeding Script
 * 
 * Creates or updates an admin user based on environment variables.
 * 
 * Required Environment Variables:
 * - ADMIN_EMAIL: Email address for the admin user
 * - ADMIN_PASSWORD: Password for the admin user
 * 
 * Usage:
 *   yarn ts-node scripts/seed-admin.ts
 * 
 * OR from nextjs_space directory:
 *   tsx scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Admin User Seeding Script');
  console.log('================================\n');

  // Validate environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌ ERROR: Missing required environment variables');
    console.error('   Required: ADMIN_EMAIL and ADMIN_PASSWORD');
    console.error('\n   Please set these in your .env file:');
    console.error('   ADMIN_EMAIL="admin@catchbarrels.app"');
    console.error('   ADMIN_PASSWORD="your-secure-password"');
    process.exit(1);
  }

  console.log(`📧 Admin Email: ${adminEmail}`);
  console.log(`🔑 Password: ${'*'.repeat(adminPassword.length)} (hidden)\n`);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: adminEmail },
    });

    if (existingUser) {
      console.log('📝 User already exists. Updating role to admin...');
      
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          role: 'admin',
          isCoach: true,
          profileComplete: true,
          completedOnboarding: true,
          membershipTier: 'elite', // Admins get highest tier
          membershipStatus: 'active',
        },
      });

      console.log('✅ User updated to admin successfully!');
      console.log('\n📊 User Details:');
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Username: ${updatedUser.username}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Is Coach: ${updatedUser.isCoach}`);
      console.log(`   Membership: ${updatedUser.membershipTier}\n`);
    } else {
      console.log('➕ Creating new admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          username: adminEmail,
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          isCoach: true,
          profileComplete: true,
          completedOnboarding: true,
          membershipTier: 'elite',
          membershipStatus: 'active',
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log('\n📊 User Details:');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Username: ${newUser.username}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Is Coach: ${newUser.isCoach}`);
      console.log(`   Membership: ${newUser.membershipTier}\n`);
    }

    console.log('✅ Admin seeding complete!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Visit https://catchbarrels.app/auth/login');
    console.log('   2. Click "Admin Sign In"');
    console.log(`   3. Login with: ${adminEmail}`);
    console.log('   4. You will be redirected to /admin\n');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
