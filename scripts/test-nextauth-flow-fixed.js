// Test NextAuth authentication flow with the fixed singleton Prisma client
const { prisma } = require('../src/lib/prisma.ts');
const bcrypt = require('bcryptjs');

async function testNextAuthWithFixedPrisma() {
  try {
    console.log('🔐 Testing NextAuth authentication flow with fixed Prisma singleton...');

    const testCredentials = {
      email: 'prueba@test.com',
      password: 'Password.123'
    };

    console.log(`📧 Testing login for: ${testCredentials.email}`);

    // Step 1: Test Prisma connection
    console.log('🔍 Step 1: Testing Prisma connection...');
    
    try {
      await prisma.$connect();
      console.log('✅ Prisma connection successful');
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
      return;
    }

    // Step 2: Get user from database using the same singleton
    console.log('🔍 Step 2: Querying user from database...');
    
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

    // Step 3: Verify password
    console.log('🔍 Step 3: Verifying password...');
    
    const isValidPassword = await bcrypt.compare(testCredentials.password, user.password);
    
    if (!isValidPassword) {
      console.error('❌ Invalid password');
      return;
    }

    console.log('✅ Password verification successful');

    // Step 4: Create user object for NextAuth (same as in config)
    console.log('🔍 Step 4: Creating NextAuth user object...');
    
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

    console.log('✅ NextAuth user object created successfully');
    console.log('📊 User object structure:');
    console.log(JSON.stringify(nextAuthUser, null, 2));

    console.log('\n🎉 Authentication flow works with singleton Prisma client!');
    console.log('🔧 The fix should resolve the "Tenant or user not found" error');

  } catch (error) {
    console.error('❌ Authentication flow failed:', error);
    
    if (error.message && error.message.includes('Tenant or user not found')) {
      console.log('\n🚨 "Tenant or user not found" error detected');
      console.log('💡 This usually means:');
      console.log('   1. Database URL is incorrect');
      console.log('   2. Database credentials have changed');
      console.log('   3. Connection pooling configuration issue');
      console.log('   4. Prisma client initialization problem');
    }
  } finally {
    try {
      await prisma.$disconnect();
      console.log('✅ Prisma disconnected properly');
    } catch (error) {
      console.error('⚠️ Error disconnecting Prisma:', error);
    }
  }
}

testNextAuthWithFixedPrisma();