// Seed database with initial test data for Domera platform
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Standard test password for all users
const TEST_PASSWORD = 'Password.123';

// Hash password helper
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create test organization
    console.log('📋 Creating test organization...');
    const organization = await prisma.organization.create({
      data: {
        name: 'Domera Development',
        slug: 'domera-dev',
        email: 'admin@domera.uy',
        phone: '+598 99 123 456',
        address: 'World Trade Center, Montevideo',
        taxId: '210123456789',
        status: 'active',
        description: 'Organización de desarrollo para testing de la plataforma Domera',
        websiteUrl: 'https://domera.uy'
      }
    });
    console.log(`✅ Organization created: ${organization.name}`);

    // 2. Hash the test password
    console.log('🔐 Hashing test password...');
    const hashedPassword = await hashPassword(TEST_PASSWORD);
    console.log(`✅ Test password hashed successfully`);

    // 3. Create multiple test users with different roles
    console.log('👥 Creating test users...');
    
    const testUsers = [
      {
        email: 'admin@domera.uy',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin',
        phone: '+598 99 111 111',
        documentType: 'CI',
        documentNumber: '11111111'
      },
      {
        email: 'owner@domera.uy',
        firstName: 'Organization',
        lastName: 'Owner',
        role: 'organization_owner',
        phone: '+598 99 222 222',
        documentType: 'CI',
        documentNumber: '22222222'
      },
      {
        email: 'prueba@test.com',
        firstName: 'Usuario',
        lastName: 'Prueba',
        role: 'admin',
        phone: '+598 99 333 333',
        documentType: 'CI',
        documentNumber: '33333333'
      },
      {
        email: 'user@domera.uy',
        firstName: 'Cliente',
        lastName: 'Regular',
        role: 'user',
        phone: '+598 99 444 444',
        documentType: 'CI',
        documentNumber: '44444444'
      }
    ];

    const createdUsers = [];
    
    for (const userData of testUsers) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          documentType: userData.documentType,
          documentNumber: userData.documentNumber,
          address: 'Av. 18 de Julio 1234, Montevideo',
          city: 'Montevideo',
          country: 'Uruguay',
          isActive: true
        }
      });
      
      // Assign role to user
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

    // Get the first admin user for creating other entities
    const adminUser = createdUsers.find(u => u.role === 'admin').user;

    // 4. Create test projects with feature flags
    console.log('🏗️ Creating test projects...');
    
    const project1 = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: 'Torres del Río',
        slug: 'torres-del-rio',
        description: 'Complejo residencial de lujo ubicado en la rambla de Montevideo con vista al Río de la Plata. Incluye amenities premium y acceso directo a la playa.',
        shortDescription: 'Torres residenciales con vista al río',
        address: 'Rambla República del Perú 1234',
        neighborhood: 'Pocitos',
        city: 'Montevideo',
        latitude: -34.9071,
        longitude: -56.1265,
        status: 'pre_sale',
        startDate: new Date('2025-03-01'),
        estimatedCompletion: new Date('2027-12-31'),
        totalUnits: 120,
        availableUnits: 118,
        basePrice: 180000,
        currency: 'USD',
        legalRegime: 'Propiedad Horizontal',
        images: JSON.stringify([
          '/images/torres-rio-1.jpg',
          '/images/torres-rio-2.jpg',
          '/images/torres-rio-3.jpg'
        ]),
        amenities: JSON.stringify([
          'Piscina climatizada',
          'Gimnasio',
          'Salón de eventos',
          'Seguridad 24hs',
          'Garage cubierto',
          'Solarium',
          'Barbacoa'
        ]),
        // Project feature flags
        hasParking: true,
        hasStudio: false,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: false,
        hasCommercial: false,
        createdBy: adminUser.id
      }
    });

    const project2 = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: 'Urban Living Cordón',
        slug: 'urban-living-cordon',
        description: 'Desarrollo urbano moderno en el corazón de Montevideo. Apartamentos de 1 y 2 dormitorios con diseño contemporáneo.',
        shortDescription: 'Apartamentos modernos en el centro',
        address: 'Av. 18 de Julio 2150',
        neighborhood: 'Cordón',
        city: 'Montevideo',
        latitude: -34.9058,
        longitude: -56.1895,
        status: 'construction',
        startDate: new Date('2024-09-01'),
        estimatedCompletion: new Date('2026-06-30'),
        totalUnits: 45,
        availableUnits: 23,
        basePrice: 120000,
        currency: 'USD',
        legalRegime: 'Propiedad Horizontal',
        images: JSON.stringify([
          '/images/urban-cordon-1.jpg',
          '/images/urban-cordon-2.jpg'
        ]),
        amenities: JSON.stringify([
          'Terraza común',
          'Coworking',
          'Depósitos individuales',
          'Ascensor',
          'Portero eléctrico'
        ]),
        // Project feature flags
        hasParking: false,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: false,
        has4Bedroom: false,
        has5Bedroom: false,
        hasCommercial: true,
        createdBy: adminUser.id
      }
    });

    // Create a third project with different features
    const project3 = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: 'Complejo Parque Central',
        slug: 'complejo-parque-central',
        description: 'Desarrollo mixto con apartamentos residenciales y locales comerciales. Ubicado cerca del Parque Batlle con excelente conectividad.',
        shortDescription: 'Complejo mixto residencial y comercial',
        address: 'Av. Italia 3500',
        neighborhood: 'Parque Batlle',
        city: 'Montevideo',
        latitude: -34.8941,
        longitude: -56.1560,
        status: 'planning',
        startDate: new Date('2025-06-01'),
        estimatedCompletion: new Date('2028-03-31'),
        totalUnits: 180,
        availableUnits: 180,
        basePrice: 95000,
        currency: 'USD',
        legalRegime: 'Propiedad Horizontal',
        images: JSON.stringify([
          '/images/parque-central-1.jpg',
          '/images/parque-central-2.jpg',
          '/images/parque-central-3.jpg'
        ]),
        amenities: JSON.stringify([
          'Área verde',
          'Juegos infantiles',
          'Locales comerciales',
          'Estacionamiento',
          'Seguridad',
          'Ascensores'
        ]),
        // Project feature flags
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: false,
        has5Bedroom: false,
        hasCommercial: true,
        createdBy: adminUser.id
      }
    });

    console.log(`✅ Projects created: ${project1.name}, ${project2.name}, ${project3.name}`);

    // 5. Create units for Torres del Río
    console.log('🏠 Creating units for Torres del Río...');
    const unitsData = [
      {
        projectId: project1.id,
        unitNumber: 'A101',
        floor: 1,
        unitType: 'apartment',
        status: 'available',
        bedrooms: 2,
        bathrooms: 2,
        totalArea: 85.5,
        builtArea: 78.2,
        orientation: 'Norte',
        facing: 'Río',
        price: 185000,
        description: 'Apartamento de 2 dormitorios con vista al río',
        features: JSON.stringify(['Balcón', 'Vista al río', 'Cocina equipada']),
        createdBy: adminUser.id
      },
      {
        projectId: project1.id,
        unitNumber: 'A102',
        floor: 1,
        unitType: 'apartment',
        status: 'available',
        bedrooms: 3,
        bathrooms: 2,
        totalArea: 105.0,
        builtArea: 95.8,
        orientation: 'Sur',
        facing: 'Ciudad',
        price: 195000,
        description: 'Apartamento de 3 dormitorios con vista a la ciudad',
        features: JSON.stringify(['Balcón', 'Suite principal', 'Cocina equipada']),
        createdBy: adminUser.id
      },
      {
        projectId: project1.id,
        unitNumber: 'B201',
        floor: 2,
        unitType: 'apartment',
        status: 'reserved',
        bedrooms: 2,
        bathrooms: 2,
        totalArea: 88.0,
        builtArea: 80.5,
        orientation: 'Norte',
        facing: 'Río',
        price: 190000,
        description: 'Apartamento de 2 dormitorios piso alto con vista al río',
        features: JSON.stringify(['Balcón amplio', 'Vista panorámica', 'Cocina equipada']),
        createdBy: adminUser.id
      }
    ];

    for (const unitData of unitsData) {
      await prisma.unit.create({ data: unitData });
    }

    // 6. Create units for Urban Living Cordón
    console.log('🏠 Creating units for Urban Living Cordón...');
    const urbanUnitsData = [
      {
        projectId: project2.id,
        unitNumber: '301',
        floor: 3,
        unitType: 'apartment',
        status: 'available',
        bedrooms: 1,
        bathrooms: 1,
        totalArea: 45.0,
        builtArea: 42.0,
        orientation: 'Este',
        facing: 'Calle',
        price: 115000,
        description: 'Monoambiente moderno ideal para jóvenes profesionales',
        features: JSON.stringify(['Balcón francés', 'Cocina integrada', 'Vestidor']),
        createdBy: adminUser.id
      },
      {
        projectId: project2.id,
        unitNumber: '402',
        floor: 4,
        unitType: 'apartment',
        status: 'available',
        bedrooms: 2,
        bathrooms: 1,
        totalArea: 65.0,
        builtArea: 58.5,
        orientation: 'Oeste',
        facing: 'Patio',
        price: 135000,
        description: 'Apartamento de 2 dormitorios con patio interno',
        features: JSON.stringify(['Patio privado', 'Cocina separada', 'Placard empotrado']),
        createdBy: adminUser.id
      }
    ];

    for (const unitData of urbanUnitsData) {
      await prisma.unit.create({ data: unitData });
    }

    // 7. Create units for Complejo Parque Central
    console.log('🏠 Creating units for Complejo Parque Central...');
    const parqueUnitsData = [
      {
        projectId: project3.id,
        unitNumber: 'S01',
        floor: 1,
        unitType: 'apartment',
        status: 'available',
        bedrooms: 0, // Studio
        bathrooms: 1,
        totalArea: 35.0,
        builtArea: 32.0,
        orientation: 'Norte',
        facing: 'Parque',
        price: 95000,
        description: 'Studio moderno con vista al parque',
        features: JSON.stringify(['Kitchenette', 'Balcón', 'Vista al parque']),
        createdBy: adminUser.id
      },
      {
        projectId: project3.id,
        unitNumber: 'C101',
        floor: 1,
        unitType: 'commercial_space',
        status: 'available',
        bedrooms: 0,
        bathrooms: 1,
        totalArea: 80.0,
        builtArea: 75.0,
        orientation: 'Este',
        facing: 'Calle',
        price: 150000,
        description: 'Local comercial con vidriera a la calle',
        features: JSON.stringify(['Vidriera', 'Depósito', 'Baño privado']),
        createdBy: adminUser.id
      },
      {
        projectId: project3.id,
        unitNumber: '205',
        floor: 2,
        unitType: 'apartment',
        status: 'available',
        bedrooms: 3,
        bathrooms: 2,
        totalArea: 95.0,
        builtArea: 87.0,
        orientation: 'Sur',
        facing: 'Patio',
        price: 140000,
        description: 'Apartamento familiar de 3 dormitorios',
        features: JSON.stringify(['Suite principal', 'Balcón', 'Cocina separada']),
        createdBy: adminUser.id
      }
    ];

    for (const unitData of parqueUnitsData) {
      await prisma.unit.create({ data: unitData });
    }

    console.log(`✅ Units created for all three projects`);

    // 8. Create user favorites
    console.log('❤️ Creating user favorites...');
    
    // Get all created units for favorites
    const allUnits = await prisma.unit.findMany({
      select: { id: true, unitNumber: true, projectId: true }
    });
    
    // Get the regular user for creating favorites
    const regularUser = createdUsers.find(u => u.role === 'user').user;
    
    // Create some sample favorites for the regular user
    const favoritesData = [
      {
        userId: regularUser.id,
        unitId: allUnits.find(u => u.unitNumber === 'A101').id, // Torres del Río unit
      },
      {
        userId: regularUser.id,
        unitId: allUnits.find(u => u.unitNumber === '301').id, // Urban Living unit
      },
      {
        userId: regularUser.id,
        unitId: allUnits.find(u => u.unitNumber === 'S01').id, // Studio in Parque Central
      }
    ];

    for (const favoriteData of favoritesData) {
      await prisma.userFavorite.create({ data: favoriteData });
    }
    
    console.log(`✅ Created ${favoritesData.length} user favorites for ${regularUser.email}`);

    // 9. Create a test professional
    console.log('⚖️ Creating test professional...');
    const professional = await prisma.professional.create({
      data: {
        userId: adminUser.id,
        professionalType: 'escribania',
        companyName: 'Estudio Jurídico Prueba',
        registrationNumber: 'ESC-001-2025',
        specializations: JSON.stringify(['Compraventa inmobiliaria', 'Sociedades']),
        serviceAreas: JSON.stringify(['Montevideo', 'Canelones']),
        hourlyRate: 150.00,
        isVerified: true,
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        isActive: true
      }
    });
    console.log(`✅ Professional created: ${professional.companyName}`);

    // 10. Summary
    console.log('📊 Seeding completed successfully!');
    console.log('='.repeat(70));
    console.log(`🏢 Organization: ${organization.name}`);
    console.log(`👥 Test Users created: ${createdUsers.length}`);
    console.log('   Test Users (Password: Password.123):');
    createdUsers.forEach(({ user, role }) => {
      console.log(`   - ${user.email} (${role})`);
    });
    console.log(`🏗️ Projects: 3 projects with comprehensive features`);
    console.log('   - Torres del Río: Luxury residential (parking, 1-4 bedrooms)');
    console.log('   - Urban Living Cordón: Modern urban (studios, 1-2 bed, commercial)');
    console.log('   - Complejo Parque Central: Mixed-use (all types + commercial)');
    console.log(`🏠 Units: 8 total units across all projects`);
    console.log('   - 2 studios, 4 apartments (1-3 bed), 1 commercial space');
    console.log(`❤️ Favorites: ${favoritesData.length} sample favorites for testing`);
    console.log(`⚖️ Professional: 1 verified professional`);
    console.log('='.repeat(70));
    console.log('🚀 Ready for testing favorites & features systems!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });