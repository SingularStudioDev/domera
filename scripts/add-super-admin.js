// Add Super Admin User for Testing
// This script creates a super admin user with your email for 2FA testing
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Configuration - CHANGE THIS TO YOUR EMAIL
const SUPER_ADMIN_EMAIL = 'singularstudio.io@gmail.com'; // ⚠️ CHANGE THIS TO YOUR ACTUAL EMAIL
const TEST_PASSWORD = 'Password.123';

// Hash password helper
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating Super Admin user for 2FA testing...');
    console.log(`📧 Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (existingUser) {
      console.log('⚠️  User already exists! Updating existing user...');

      // Update existing user
      await prisma.user.update({
        where: { email: SUPER_ADMIN_EMAIL },
        data: {
          password: await hashPassword(TEST_PASSWORD),
          isActive: true,
        },
      });

      // Check if super admin role exists
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: existingUser.id,
          role: 'admin',
          organizationId: null,
        },
      });

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            role: 'admin',
            organizationId: null, // Super admin has no organization
            isActive: true,
          },
        });
        console.log('✅ Super admin role added to existing user');
      } else {
        console.log('✅ User already has super admin role');
      }
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: SUPER_ADMIN_EMAIL,
          password: await hashPassword(TEST_PASSWORD),
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+598 99 000 000',
          isActive: true,
          country: 'Uruguay',
        },
      });

      // Create super admin role (organizationId: null = super admin)
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          role: 'admin',
          organizationId: null, // Super admin has no organization
          isActive: true,
        },
      });

      console.log(`✅ Super Admin user created: ${newUser.email}`);
    }

    console.log('');
    console.log('🎉 Super Admin setup complete!');
    console.log('');
    console.log('🧪 Testing instructions:');
    console.log('1. Go to http://localhost:3000/super');
    console.log(`2. Login with: ${SUPER_ADMIN_EMAIL}`);
    console.log(`3. Password: ${TEST_PASSWORD}`);
    console.log('4. Check your email for the 2FA code');
    console.log('5. Complete the verification to access the dashboard');
    console.log('');
    console.log(
      '⚠️  Make sure your email service is configured to receive 2FA codes!'
    );
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Validation check
if (SUPER_ADMIN_EMAIL === 'your-email@example.com') {
  console.log(
    '❌ Please update SUPER_ADMIN_EMAIL in the script with your actual email address!'
  );
  console.log(
    '📝 Edit scripts/add-super-admin.js and change the SUPER_ADMIN_EMAIL variable'
  );
  process.exit(1);
}

createSuperAdmin();
