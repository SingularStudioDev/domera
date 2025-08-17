// Check user passwords in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPasswords() {
  try {
    console.log('🔍 Checking user passwords in database...');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        isActive: true,
        userRoles: {
          where: { isActive: true },
          select: {
            role: true,
            organizationId: true,
            isActive: true
          }
        }
      }
    });

    console.log(`\n📊 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   - Name: ${user.firstName} ${user.lastName}`);
      console.log(`   - Active: ${user.isActive}`);
      console.log(`   - Password: ${user.password ? `Set (${user.password.substring(0, 20)}...)` : 'NOT SET'}`);
      console.log(`   - Roles: ${user.userRoles.map(r => r.role).join(', ') || 'No roles'}`);
    });

    // Check if passwords look like hashes
    const usersWithoutPasswords = users.filter(u => !u.password);
    const usersWithPlaintextPasswords = users.filter(u => u.password && !u.password.startsWith('$2b$'));

    if (usersWithoutPasswords.length > 0) {
      console.log(`\n❌ Users without passwords: ${usersWithoutPasswords.map(u => u.email).join(', ')}`);
    }

    if (usersWithPlaintextPasswords.length > 0) {
      console.log(`\n❌ Users with plaintext passwords: ${usersWithPlaintextPasswords.map(u => u.email).join(', ')}`);
    }

    if (usersWithoutPasswords.length === 0 && usersWithPlaintextPasswords.length === 0) {
      console.log(`\n✅ All users have properly hashed passwords (bcrypt format)`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPasswords()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });