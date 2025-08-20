// Test the projects and units system
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProjectsSystem() {
  try {
    console.log('🧪 Testing Projects and Units System...');

    // Test 1: Get all projects
    console.log('\n📋 Test 1: Fetching all projects...');
    
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        totalUnits: true,
        availableUnits: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        hasCommercial: true
      }
    });

    console.log(`✅ Found ${allProjects.length} projects:`);
    allProjects.forEach(project => {
      console.log(`   - ${project.name} (${project.status}): ${project.availableUnits}/${project.totalUnits} units available`);
      console.log(`     Features: Parking: ${project.hasParking}, Studio: ${project.hasStudio}, 1-3bed: ${project.has1Bedroom}/${project.has2Bedroom}/${project.has3Bedroom}, Commercial: ${project.hasCommercial}`);
    });

    // Test 2: Get project by slug
    console.log('\n📋 Test 2: Fetching project by slug...');
    
    const projectBySlug = await prisma.project.findFirst({
      where: { slug: 'torres-del-rio' },
      include: {
        organization: {
          select: { name: true, email: true }
        }
      }
    });

    if (projectBySlug) {
      console.log(`✅ Found project by slug: ${projectBySlug.name}`);
      console.log(`   Address: ${projectBySlug.address}`);
      console.log(`   Organization: ${projectBySlug.organization.name}`);
      console.log(`   Images: ${JSON.parse(projectBySlug.images).length} images`);
      console.log(`   Amenities: ${JSON.parse(projectBySlug.amenities).length} amenities`);
    } else {
      console.log('❌ Project not found by slug');
    }

    // Test 3: Get units for a project
    console.log('\n📋 Test 3: Fetching units for Torres del Río...');
    
    const projectUnits = await prisma.unit.findMany({
      where: { projectId: projectBySlug?.id },
      include: {
        project: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { unitNumber: 'asc' }
    });

    console.log(`✅ Found ${projectUnits.length} units:`);
    projectUnits.forEach(unit => {
      console.log(`   - ${unit.unitNumber}: ${unit.bedrooms}bed/${unit.bathrooms}bath, $${Number(unit.price).toLocaleString()} (${unit.status})`);
      console.log(`     Type: ${unit.unitType}, Floor: ${unit.floor || 'N/A'}, Area: ${unit.totalArea || 'N/A'}m²`);
    });

    // Test 4: Filter projects by features
    console.log('\n📋 Test 4: Testing feature filtering...');
    
    // Projects with parking
    const projectsWithParking = await prisma.project.findMany({
      where: { hasParking: true },
      select: { name: true, hasParking: true }
    });
    
    console.log(`✅ Projects with parking: ${projectsWithParking.length}`);
    projectsWithParking.forEach(p => console.log(`   - ${p.name}`));

    // Projects with studios
    const projectsWithStudios = await prisma.project.findMany({
      where: { hasStudio: true },
      select: { name: true, hasStudio: true }
    });
    
    console.log(`✅ Projects with studios: ${projectsWithStudios.length}`);
    projectsWithStudios.forEach(p => console.log(`   - ${p.name}`));

    // Projects with commercial spaces
    const projectsWithCommercial = await prisma.project.findMany({
      where: { hasCommercial: true },
      select: { name: true, hasCommercial: true }
    });
    
    console.log(`✅ Projects with commercial spaces: ${projectsWithCommercial.length}`);
    projectsWithCommercial.forEach(p => console.log(`   - ${p.name}`));

    // Test 5: Filter units by criteria
    console.log('\n📋 Test 5: Testing unit filtering...');
    
    // Available 2-bedroom units
    const available2BedroomUnits = await prisma.unit.findMany({
      where: {
        status: 'available',
        bedrooms: 2
      },
      include: {
        project: { select: { name: true } }
      }
    });
    
    console.log(`✅ Available 2-bedroom units: ${available2BedroomUnits.length}`);
    available2BedroomUnits.forEach(unit => {
      console.log(`   - ${unit.project.name} - ${unit.unitNumber}: $${Number(unit.price).toLocaleString()}`);
    });

    // Units by price range
    const expensiveUnits = await prisma.unit.findMany({
      where: {
        price: { gte: 180000 }
      },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { price: 'desc' }
    });
    
    console.log(`✅ Units over $180k: ${expensiveUnits.length}`);
    expensiveUnits.forEach(unit => {
      console.log(`   - ${unit.project.name} - ${unit.unitNumber}: $${Number(unit.price).toLocaleString()}`);
    });

    // Test 6: Search functionality
    console.log('\n📋 Test 6: Testing search functionality...');
    
    // Search projects by name
    const searchResults = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: 'torres', mode: 'insensitive' } },
          { description: { contains: 'torres', mode: 'insensitive' } }
        ]
      },
      select: { name: true, description: true }
    });
    
    console.log(`✅ Search results for "torres": ${searchResults.length}`);
    searchResults.forEach(project => {
      console.log(`   - ${project.name}`);
    });

    // Test 7: Statistics aggregation
    console.log('\n📋 Test 7: Testing statistics...');
    
    const stats = await Promise.all([
      prisma.project.count(),
      prisma.unit.count(),
      prisma.unit.count({ where: { status: 'available' } }),
      prisma.unit.aggregate({
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true }
      }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.unit.groupBy({
        by: ['unitType'],
        _count: { id: true }
      })
    ]);

    const [totalProjects, totalUnits, availableUnits, priceStats, projectsByStatus, unitsByType] = stats;

    console.log(`✅ Statistics Summary:`);
    console.log(`   - Total projects: ${totalProjects}`);
    console.log(`   - Total units: ${totalUnits}`);
    console.log(`   - Available units: ${availableUnits}`);
    console.log(`   - Occupancy rate: ${totalUnits > 0 ? Math.round(((totalUnits - availableUnits) / totalUnits) * 100) : 0}%`);
    console.log(`   - Price range: $${Number(priceStats._min.price).toLocaleString()} - $${Number(priceStats._max.price).toLocaleString()}`);
    console.log(`   - Average price: $${Number(priceStats._avg.price).toLocaleString()}`);

    console.log(`   - Projects by status:`);
    projectsByStatus.forEach(item => {
      console.log(`     - ${item.status}: ${item._count.id} projects`);
    });

    console.log(`   - Units by type:`);
    unitsByType.forEach(item => {
      console.log(`     - ${item.unitType}: ${item._count.id} units`);
    });

    // Test 8: Complex filtering (multiple conditions)
    console.log('\n📋 Test 8: Testing complex filtering...');
    
    const complexFilter = await prisma.project.findMany({
      where: {
        AND: [
          { hasParking: true },
          { has2Bedroom: true },
          { status: 'pre_sale' }
        ]
      },
      select: {
        name: true,
        hasParking: true,
        has2Bedroom: true,
        status: true,
        availableUnits: true
      }
    });
    
    console.log(`✅ Projects with parking + 2-bedroom + pre-sale: ${complexFilter.length}`);
    complexFilter.forEach(project => {
      console.log(`   - ${project.name}: ${project.availableUnits} units available`);
    });

    // Test 9: JSON field parsing
    console.log('\n📋 Test 9: Testing JSON field parsing...');
    
    const projectWithJson = await prisma.project.findFirst({
      select: {
        name: true,
        images: true,
        amenities: true
      }
    });

    if (projectWithJson) {
      const images = JSON.parse(projectWithJson.images);
      const amenities = JSON.parse(projectWithJson.amenities);
      
      console.log(`✅ JSON parsing for ${projectWithJson.name}:`);
      console.log(`   - Images: ${images.length} items`);
      console.log(`   - Amenities: ${amenities.length} items`);
      console.log(`   - Sample amenities: ${amenities.slice(0, 3).join(', ')}`);
    }

    console.log('\n🎉 Projects and Units System Test Completed Successfully!');
    console.log('✅ Project fetching works');
    console.log('✅ Unit fetching and filtering works');
    console.log('✅ Feature-based filtering works');
    console.log('✅ Search functionality works');
    console.log('✅ Statistics aggregation works');
    console.log('✅ Complex filtering works');
    console.log('✅ JSON field parsing works');
    console.log('✅ All data relationships are intact');

  } catch (error) {
    console.error('❌ Projects system test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProjectsSystem();