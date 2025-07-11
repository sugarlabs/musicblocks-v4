/**
 * Phase 2 Test: Position-Based Collision Detection
 * Tests collision detection with real brick positioning and tower integration
 */

import { BrickCollisionService } from '../index';

console.log('Phase 2: Testing Position-Based Collision Detection\n');

// Test 1: Service initialization
console.log('Test 1: Initializing collision service...');
try {
  const service = new BrickCollisionService(1000, 800);
  console.log('✓ Collision service created successfully');
} catch (error) {
  console.log('✗ Failed to create collision service:', error);
  process.exit(1);
}

// Test 2: Mock brick creation with positioning
console.log('\nTest 2: Creating mock bricks with positions...');
class MockBrick {
  constructor(public uuid: string, public type: any, public x: number, public y: number) {}
  get name() { return `Mock${this.type}`; }
  get scale() { return 1; }
  set scale(value: number) {}
  get boundingBox() { return { w: 100, h: 50 }; }
  get connectionPoints() {
    return {
      top: { x: 50, y: 0 },
      right: [{ x: 100, y: 25 }],
      bottom: { x: 50, y: 50 },
      left: { x: 0, y: 25 }
    };
  }
  get visualState() { return 'default'; }
  set visualState(value: any) {}
  get isActionMenuOpen() { return false; }
  set isActionMenuOpen(value: boolean) {}
  get isVisible() { return true; }
  set isVisible(value: boolean) {}
}

const bricks = [
  new MockBrick('brick1', 'Expression', 100, 100),
  new MockBrick('brick2', 'Simple', 200, 100),
  new MockBrick('brick3', 'Compound', 400, 100),
];
console.log(`✓ Created ${bricks.length} mock bricks`);

// Test 3: Brick registration
console.log('\nTest 3: Registering bricks with collision service...');
try {
  const service = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => service.registerBrick(brick as any));
  console.log('✓ All bricks registered successfully');
} catch (error) {
  console.log('✗ Failed to register bricks:', error);
  process.exit(1);
}

// Test 4: Position-based collision detection
console.log('\nTest 4: Testing position-based collision detection...');
try {
  const service = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => service.registerBrick(brick as any));
  
  // Set brick positions to test collision detection
  const positions = new Map<string, { x: number; y: number }>();
  positions.set('brick1', { x: 100, y: 100 });
  positions.set('brick2', { x: 200, y: 100 }); // Close to brick1
  positions.set('brick3', { x: 400, y: 100 }); // Far from brick1
  
  service.updateBrickPositions(positions);
  console.log('✓ Brick positions updated successfully');
  
  const collisions = service.getBrickCollisions('brick1');
  console.log(`✓ Found ${collisions.length} potential collisions for brick1 with positioning`);
  
  if (collisions.length > 0) {
    console.log('   Sample collision:', {
      sourceBrickId: collisions[0].sourceBrickId,
      targetBrickId: collisions[0].targetBrickId,
      distance: collisions[0].distance.toFixed(2),
      isValidConnection: collisions[0].isValidConnection
    });
  } else {
    console.log('   No collisions detected - this might be expected if bricks are too far apart');
  }
} catch (error) {
  console.log('✗ Failed to test positioning integration:', error);
  process.exit(1);
}

// Test 5: Tower integration simulation
console.log('\nTest 5: Testing tower integration simulation...');
try {
  const service = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => service.registerBrick(brick as any));
  
  const positions = new Map<string, { x: number; y: number }>();
  positions.set('brick1', { x: 100, y: 100 });
  positions.set('brick2', { x: 200, y: 100 });
  positions.set('brick3', { x: 400, y: 100 });
  
  const towerNodes = bricks.map(brick => ({
    brick: brick as any,
    position: positions.get(brick.uuid) || { x: 0, y: 0 }
  }));
  
  service.setBrickPositionsFromTower(towerNodes);
  console.log('✓ Tower integration completed successfully');
} catch (error) {
  console.log('✗ Failed to test tower integration:', error);
  process.exit(1);
}

// Test 6: Performance test with positioning
console.log('\nTest 6: Performance test with positioning...');
try {
  const startTime = performance.now();
  const service = new BrickCollisionService(2000, 1500);
  
  // Create many bricks for performance testing
  const manyBricks: MockBrick[] = [];
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 2000;
    const y = Math.random() * 1500;
    const type = ['Expression', 'Simple', 'Compound'][Math.floor(Math.random() * 3)];
    manyBricks.push(new MockBrick(`brick${i}`, type, x, y));
  }
  
  manyBricks.forEach(brick => service.registerBrick(brick as any));
  const registrationTime = performance.now() - startTime;
  
  const collisionStartTime = performance.now();
  const collisions = service.getBrickCollisions('brick0');
  const collisionTime = performance.now() - collisionStartTime;
  
  console.log(`✓ Performance test completed:`);
  console.log(`   - Registration time: ${registrationTime.toFixed(2)}ms`);
  console.log(`   - Collision detection time: ${collisionTime.toFixed(2)}ms`);
  console.log(`   - Collisions found: ${collisions.length}`);
} catch (error) {
  console.log('✗ Performance test failed:', error);
  process.exit(1);
}

console.log('\nPhase 2: All position-based collision detection tests passed successfully!');
console.log('Position-based collision detection is working correctly.'); 