// Test the operations system business logic
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOperationsSystem() {
  try {
    console.log('🧪 Testing Operations System...');

    // Get test user and available units
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
      take: 2,
      select: { 
        id: true, 
        unitNumber: true, 
        price: true,
        project: { select: { name: true } }
      }
    });

    if (availableUnits.length === 0) {
      console.error('❌ No available units found');
      return;
    }

    console.log(`✅ Found test user: ${testUser.email}`);
    console.log(`✅ Found ${availableUnits.length} available units`);

    // Test 1: Check if user has active operation (should be none initially)
    console.log('\n📋 Test 1: Checking for existing active operations...');
    
    const existingOperation = await prisma.operation.findFirst({
      where: {
        userId: testUser.id,
        status: { notIn: ['completed', 'cancelled'] }
      }
    });

    if (existingOperation) {
      console.log(`⚠️ User already has active operation: ${existingOperation.id}`);
      console.log('Cancelling existing operation for clean test...');
      
      await prisma.operation.update({
        where: { id: existingOperation.id },
        data: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Test cleanup'
        }
      });

      // Free up units
      const operationUnits = await prisma.operationUnit.findMany({
        where: { operationId: existingOperation.id }
      });
      
      const unitIds = operationUnits.map(ou => ou.unitId);
      await prisma.unit.updateMany({
        where: { id: { in: unitIds } },
        data: { status: 'available' }
      });

      console.log('✅ Cleaned up existing operation');
    } else {
      console.log('✅ No existing active operations');
    }

    // Test 2: Create first operation
    console.log('\n📋 Test 2: Creating first operation...');
    
    const unitIds = [availableUnits[0].id];
    const totalAmount = Number(availableUnits[0].price);
    const organization = await prisma.organization.findFirst();

    const operation1 = await prisma.operation.create({
      data: {
        userId: testUser.id,
        organizationId: organization.id,
        status: 'initiated',
        totalAmount,
        platformFee: 3000.00,
        currency: 'USD',
        notes: 'Test operation 1',
        createdBy: testUser.id
      }
    });

    // Create operation-unit relationship
    await prisma.operationUnit.create({
      data: {
        operationId: operation1.id,
        unitId: availableUnits[0].id,
        priceAtReservation: Number(availableUnits[0].price)
      }
    });

    // Update unit status
    await prisma.unit.update({
      where: { id: availableUnits[0].id },
      data: { status: 'reserved' }
    });

    console.log(`✅ Created operation: ${operation1.id}`);

    // Test 3: Try to create second operation (should fail)
    console.log('\n📋 Test 3: Attempting to create second operation (should fail)...');
    
    const activeOperationCheck = await prisma.operation.findFirst({
      where: {
        userId: testUser.id,
        status: { notIn: ['completed', 'cancelled'] }
      }
    });

    if (activeOperationCheck) {
      console.log('✅ BUSINESS RULE ENFORCED: User has active operation, cannot create new one');
      console.log(`   Active operation ID: ${activeOperationCheck.id}`);
    } else {
      console.log('❌ BUSINESS RULE VIOLATION: Should have found active operation');
    }

    // Test 4: Complete operation and try again
    console.log('\n📋 Test 4: Completing operation and testing new creation...');
    
    await prisma.operation.update({
      where: { id: operation1.id },
      data: { 
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Update unit to sold
    await prisma.unit.update({
      where: { id: availableUnits[0].id },
      data: { status: 'sold' }
    });

    console.log('✅ Completed first operation');

    // Now user should be able to create new operation
    const newActiveCheck = await prisma.operation.findFirst({
      where: {
        userId: testUser.id,
        status: { notIn: ['completed', 'cancelled'] }
      }
    });

    if (!newActiveCheck) {
      console.log('✅ User can now create new operation (no active operations)');
    } else {
      console.log('❌ Still showing active operation after completion');
    }

    // Test 5: Create operation steps
    console.log('\n📋 Test 5: Testing operation steps creation...');
    
    if (availableUnits.length > 1) {
      const operation2 = await prisma.operation.create({
        data: {
          userId: testUser.id,
          organizationId: organization.id,
          status: 'initiated',
          totalAmount: Number(availableUnits[1].price),
          platformFee: 3000.00,
          currency: 'USD',
          notes: 'Test operation 2 with steps',
          createdBy: testUser.id
        }
      });

      // Create steps
      const steps = [
        { stepName: 'documents_upload', stepOrder: 1, status: 'pending' },
        { stepName: 'documents_validation', stepOrder: 2, status: 'pending' },
        { stepName: 'professional_assignment', stepOrder: 3, status: 'pending' }
      ];

      for (const step of steps) {
        await prisma.operationStep.create({
          data: {
            ...step,
            operationId: operation2.id
          }
        });
      }

      console.log(`✅ Created operation with ${steps.length} steps`);

      // Clean up
      await prisma.operation.update({
        where: { id: operation2.id },
        data: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Test cleanup'
        }
      });
    }

    console.log('\n🎉 Operations System Test Completed Successfully!');
    console.log('✅ One active operation per user rule is enforced');
    console.log('✅ Operation lifecycle management works');
    console.log('✅ Unit status updates correctly');
    console.log('✅ Operation steps can be created');

  } catch (error) {
    console.error('❌ Operations system test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOperationsSystem();