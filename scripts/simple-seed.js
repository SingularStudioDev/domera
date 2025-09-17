// Simple seed for basic testing - users and organization only
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Standard test password for all users
const TEST_PASSWORD = 'Password.123';

// Hash password helper
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function simpleSeed() {
  try {
    console.log('🌱 Starting simple database seeding...');

    // 1. Create organization "dom-desarrollos"
    console.log('📋 Creating dom-desarrollos organization...');

    // Check if organization already exists
    let organization = await prisma.organization.findUnique({
      where: { slug: 'dom-desarrollos' }
    });

    if (organization) {
      console.log('⚠️  Organization dom-desarrollos already exists');
    } else {
      organization = await prisma.organization.create({
        data: {
          name: 'Dom Desarrollos',
          slug: 'dom-desarrollos',
          email: 'info@dom-desarrollos.com',
          phone: '+598 99 123 456',
          address: 'Av. Brasil 2500, Montevideo',
          taxId: '210987654321',
          status: 'active',
          description: 'Desarrolladora inmobiliaria especializada en proyectos residenciales',
          websiteUrl: 'https://dom-desarrollos.com'
        }
      });
      console.log(`✅ Organization created: ${organization.name}`);
    }

    // 2. Hash the test password
    console.log('🔐 Hashing test password...');
    const hashedPassword = await hashPassword(TEST_PASSWORD);

    // 3. Create test users
    console.log('👥 Creating test users...');

    const testUsers = [
      {
        email: 'owner@domera.uy',
        firstName: 'María',
        lastName: 'Rodríguez',
        role: 'organization_owner',
        phone: '+598 99 111 111',
        documentType: 'CI',
        documentNumber: '11111111'
      },
      {
        email: 'user@domera.uy',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'user',
        phone: '+598 99 222 222',
        documentType: 'CI',
        documentNumber: '22222222'
      },
      {
        email: 'sales@domera.uy',
        firstName: 'Ana',
        lastName: 'García',
        role: 'sales_manager',
        phone: '+598 99 333 333',
        documentType: 'CI',
        documentNumber: '33333333'
      },
      {
        email: 'finance@domera.uy',
        firstName: 'Carlos',
        lastName: 'López',
        role: 'finance_manager',
        phone: '+598 99 444 444',
        documentType: 'CI',
        documentNumber: '44444444'
      }
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (user) {
        console.log(`⚠️  User ${userData.email} already exists`);
        createdUsers.push({ user, role: userData.role });
        continue;
      }

      // Create user
      user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          documentType: userData.documentType,
          documentNumber: userData.documentNumber,
          address: 'Montevideo, Uruguay',
          city: 'Montevideo',
          country: 'Uruguay',
          isActive: true
        }
      });

      // Assign role to user for the organization
      await prisma.userRole.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: userData.role,
          isActive: true
        }
      });

      createdUsers.push({ user, role: userData.role });
      console.log(`✅ User created: ${user.email} (${userData.role})`);
    }

    // 4. Create a test professional (for future operations)
    console.log('⚖️ Creating test professional...');

    const ownerUser = createdUsers.find(u => u.role === 'organization_owner').user;

    // Check if professional already exists
    const existingProfessional = await prisma.professional.findFirst({
      where: { userId: ownerUser.id }
    });

    if (!existingProfessional) {
      await prisma.professional.create({
        data: {
          userId: ownerUser.id,
          professionalType: 'escribania',
          companyName: 'Estudio Jurídico Dom',
          registrationNumber: 'ESC-001-2025',
          specializations: JSON.stringify(['Compraventa inmobiliaria', 'Sociedades']),
          serviceAreas: JSON.stringify(['Montevideo', 'Canelones']),
          hourlyRate: 150.00,
          isVerified: true,
          verifiedBy: ownerUser.id,
          verifiedAt: new Date(),
          isActive: true
        }
      });
      console.log(`✅ Professional created for ${ownerUser.email}`);
    } else {
      console.log('⚠️  Professional already exists');
    }

    // 5. Summary
    console.log('📊 Simple seeding completed successfully!');
    console.log('='.repeat(50));
    console.log(`🏢 Organization: ${organization.name} (${organization.slug})`);
    console.log(`📧 Organization ID: ${organization.id}`);
    console.log(`👥 Test Users (Password: ${TEST_PASSWORD}):`);
    createdUsers.forEach(({ user, role }) => {
      console.log(`   - ${user.email} (${role})`);
    });
    console.log('='.repeat(50));
    console.log('🎯 Ready for testing client creation system!');
    console.log('📝 Copy this organization ID to clients page:');
    console.log(`const organizationId = "${organization.id}";`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });