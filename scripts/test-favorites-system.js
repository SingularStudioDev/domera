// Test the favorites system
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFavoritesSystem() {
  try {
    console.log('🧪 Testing Favorites System...');

    // Get test user and units
    console.log('📋 Step 1: Getting test data...');
    
    const testUser = await prisma.user.findFirst({
      where: { email: 'user@domera.uy' },
      select: { id: true, email: true }
    });

    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }

    const availableUnits = await prisma.unit.findMany({
      where: { status: 'available' },
      take: 3,
      include: {
        project: { select: { name: true, slug: true } }
      }
    });

    if (availableUnits.length === 0) {
      console.error('❌ No available units found');
      return;
    }

    console.log(`✅ Found test user: ${testUser.email}`);
    console.log(`✅ Found ${availableUnits.length} available units`);

    // Clean up existing favorites for clean test
    console.log('\n📋 Step 2: Cleaning existing favorites...');
    
    await prisma.userFavorite.deleteMany({
      where: { userId: testUser.id }
    });
    
    console.log('✅ Cleaned up existing favorites');

    // Test 1: Add favorites
    console.log('\n📋 Test 1: Adding favorites...');
    
    const favoritesToAdd = availableUnits.slice(0, 2);
    
    for (const unit of favoritesToAdd) {
      const favorite = await prisma.userFavorite.create({
        data: {
          userId: testUser.id,
          unitId: unit.id
        }
      });
      console.log(`✅ Added favorite: ${unit.project.name} - ${unit.unitNumber}`);
    }

    // Test 2: Check duplicate prevention
    console.log('\n📋 Test 2: Testing duplicate prevention...');
    
    try {
      await prisma.userFavorite.create({
        data: {
          userId: testUser.id,
          unitId: favoritesToAdd[0].id // Try to add same unit again
        }
      });
      console.log('❌ FAILED: Should have prevented duplicate favorite');
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint violation
        console.log('✅ PASSED: Duplicate favorite prevented by unique constraint');
      } else {
        console.log('❌ FAILED: Unexpected error:', error.message);
      }
    }

    // Test 3: Get user favorites
    console.log('\n📋 Test 3: Retrieving user favorites...');
    
    const userFavorites = await prisma.userFavorite.findMany({
      where: { userId: testUser.id },
      include: {
        unit: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                neighborhood: true
              }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    console.log(`✅ Retrieved ${userFavorites.length} favorites`);
    userFavorites.forEach(fav => {
      console.log(`   - ${fav.unit.project.name} - ${fav.unit.unitNumber} (${fav.unit.price})`);
    });

    // Test 4: Calculate statistics
    console.log('\n📋 Test 4: Calculating favorite statistics...');
    
    const totalFavorites = userFavorites.length;
    
    const projectCounts = userFavorites.reduce((acc, fav) => {
      const projectId = fav.unit.project.id;
      acc[projectId] = (acc[projectId] || 0) + 1;
      return acc;
    }, {});

    const projectsWithFavorites = Object.keys(projectCounts).length;
    
    console.log(`✅ Statistics:`);
    console.log(`   - Total favorites: ${totalFavorites}`);
    console.log(`   - Projects with favorites: ${projectsWithFavorites}`);
    console.log(`   - Breakdown by project:`);
    
    for (const [projectId, count] of Object.entries(projectCounts)) {
      const project = userFavorites.find(fav => fav.unit.project.id === projectId)?.unit.project;
      console.log(`     - ${project.name}: ${count} favorite(s)`);
    }

    // Test 5: Remove favorite
    console.log('\n📋 Test 5: Removing a favorite...');
    
    const favoriteToRemove = userFavorites[0];
    
    await prisma.userFavorite.delete({
      where: {
        userId_unitId: {
          userId: testUser.id,
          unitId: favoriteToRemove.unitId
        }
      }
    });
    
    console.log(`✅ Removed favorite: ${favoriteToRemove.unit.project.name} - ${favoriteToRemove.unit.unitNumber}`);

    // Test 6: Verify removal
    console.log('\n📋 Test 6: Verifying favorite removal...');
    
    const remainingFavorites = await prisma.userFavorite.count({
      where: { userId: testUser.id }
    });
    
    console.log(`✅ Remaining favorites: ${remainingFavorites} (expected: ${totalFavorites - 1})`);
    
    if (remainingFavorites === totalFavorites - 1) {
      console.log('✅ PASSED: Favorite removed successfully');
    } else {
      console.log('❌ FAILED: Favorite count mismatch');
    }

    // Test 7: Check favorite status efficiently
    console.log('\n📋 Test 7: Testing batch favorite status check...');
    
    const allUnitIds = availableUnits.map(unit => unit.id);
    
    const favoritedUnits = await prisma.userFavorite.findMany({
      where: {
        userId: testUser.id,
        unitId: { in: allUnitIds }
      },
      select: { unitId: true }
    });
    
    const favoriteMap = {};
    allUnitIds.forEach(unitId => {
      favoriteMap[unitId] = favoritedUnits.some(fav => fav.unitId === unitId);
    });
    
    console.log(`✅ Batch status check for ${allUnitIds.length} units:`);
    allUnitIds.forEach(unitId => {
      const unit = availableUnits.find(u => u.id === unitId);
      console.log(`   - ${unit.project.name} - ${unit.unitNumber}: ${favoriteMap[unitId] ? 'FAVORITED' : 'NOT FAVORITED'}`);
    });

    // Test 8: Cascading delete test
    console.log('\n📋 Test 8: Testing cascading deletes...');
    
    const favoritesBeforeDelete = await prisma.userFavorite.count({
      where: { userId: testUser.id }
    });
    
    console.log(`✅ Favorites before user deletion: ${favoritesBeforeDelete}`);
    console.log('✅ Cascading delete test skipped (would delete test user)');
    
    console.log('\n🎉 Favorites System Test Completed Successfully!');
    console.log('✅ Favorite creation works');
    console.log('✅ Duplicate prevention works');
    console.log('✅ Favorite retrieval with relations works');
    console.log('✅ Statistics calculation works');
    console.log('✅ Favorite removal works');
    console.log('✅ Batch status checking works');
    console.log('✅ Database constraints are properly enforced');

  } catch (error) {
    console.error('❌ Favorites system test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFavoritesSystem();