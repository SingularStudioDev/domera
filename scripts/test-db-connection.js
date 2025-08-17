// Test database connection and schema
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔗 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if tables exist by querying organization count
    const orgCount = await prisma.organization.count();
    console.log(`📊 Organizations table exists. Current count: ${orgCount}`);

    // Check if users table exists
    const userCount = await prisma.user.count();
    console.log(`👥 Users table exists. Current count: ${userCount}`);

    // Check if projects table exists
    const projectCount = await prisma.project.count();
    console.log(`🏗️ Projects table exists. Current count: ${projectCount}`);

    console.log('🎉 All core tables are available and accessible!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();