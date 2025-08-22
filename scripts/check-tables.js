// Check if super admin tables exist
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Checking super admin tables...');

    // Check if tables exist by trying to query them
    const securityLogCount = await prisma.securityLog.count();
    console.log(`✅ SecurityLog table exists (${securityLogCount} records)`);

    const twoFactorTokenCount = await prisma.twoFactorToken.count();
    console.log(`✅ TwoFactorToken table exists (${twoFactorTokenCount} records)`);

    const superAdminSessionCount = await prisma.superAdminSession.count();
    console.log(`✅ SuperAdminSession table exists (${superAdminSessionCount} records)`);

    console.log('🎉 All super admin tables are ready!');

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('💡 The tables might not exist. Running migration...');
      // This error means tables don't exist
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();