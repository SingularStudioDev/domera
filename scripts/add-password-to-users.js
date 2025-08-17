// Add password field and hash passwords for existing users
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addPasswordToUsers() {
  try {
    console.log('🔐 Starting password migration...');

    // First, let's add the password column using raw SQL with a default value
    console.log('📊 Adding password column to users table...');
    
    // Hash the default password "Password.123"
    const defaultPassword = 'Password.123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    console.log(`🔒 Default password hashed: ${hashedPassword.substring(0, 20)}...`);

    // Add column with default value
    await prisma.$executeRaw`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255) 
      DEFAULT ${hashedPassword}
    `;

    console.log('✅ Password column added successfully');

    // Update existing users to ensure they have the hashed password
    console.log('🔄 Updating existing users...');
    
    const result = await prisma.$executeRaw`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE password IS NULL OR password = ''
    `;

    console.log(`✅ Updated ${result} user(s) with hashed password`);

    // Verify the update
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    console.log('📋 Current users:');
    users.forEach(user => {
      console.log(`  - ${user.email}: ${user.password ? 'Password set' : 'No password'}`);
    });

    console.log('🎉 Password migration completed successfully!');
    console.log(`🔑 All users now have password: "${defaultPassword}"`);

  } catch (error) {
    console.error('❌ Password migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordToUsers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });