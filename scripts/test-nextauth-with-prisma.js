// Test NextAuth authentication flow using Prisma
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testNextAuthWithPrisma() {
  try {
    console.log('🔐 Testing NextAuth authentication flow with Prisma...');

    const testCredentials = {
      email: 'prueba@test.com',
      password: 'Password.123'
    };

    console.log(`📧 Testing login for: ${testCredentials.email}`);

    // Step 1: Get user from database using Prisma
    console.log('🔍 Step 1: Querying user from database...');
    
    const user = await prisma.user.findFirst({
      where: {
        email: testCredentials.email,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        userRoles: {
          where: { isActive: true },
          select: {
            role: true,
            organizationId: true,
            isActive: true,
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found in database');
    console.log('📊 User data structure:');
    console.log(JSON.stringify(user, null, 2));

    // Step 2: Verify password
    console.log('🔍 Step 2: Verifying password...');
    
    const isValidPassword = await bcrypt.compare(testCredentials.password, user.password);
    
    if (!isValidPassword) {
      console.error('❌ Invalid password');
      return;
    }

    console.log('✅ Password verification successful');

    // Step 3: Create user object for NextAuth
    console.log('🔍 Step 3: Creating NextAuth user object...');
    
    const nextAuthUser = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      image: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userRoles || [],
      isActive: user.isActive
    };

    console.log('✅ NextAuth user object created:');
    console.log(JSON.stringify(nextAuthUser, null, 2));

    console.log('\n🎉 Authentication flow completed successfully!');
    console.log('📝 This structure will work with NextAuth');

  } catch (error) {
    console.error('❌ Authentication flow failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNextAuthWithPrisma();