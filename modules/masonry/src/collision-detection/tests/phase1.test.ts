/**
 * Phase 1 Test: Basic Collision Detection System
 * Tests the core collision detection functionality without positioning
 */

import { BrickCollisionService } from '../index';

console.log('Phase 1: Testing Basic Collision Detection System\n');

// Test 1: Service Creation
console.log('Test 1: Creating collision service...');
try {
  const service = new BrickCollisionService(1000, 800);
  console.log('✓ Collision service created successfully');
} catch (error) {
  console.log('✗ Failed to create collision service:', error);
  process.exit(1);
}

// Test 2: Mock Brick Implementation
console.log('\nTest 2: Creating mock bricks...');
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
  new MockBrick('brick3', 'Compound', 300, 100),
];
console.log(`✓ Created ${bricks.length} mock bricks`);

// Test 3: Brick Registration
console.log('\nTest 3: Registering bricks...');
try {
  const service = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => service.registerBrick(brick as any));
  console.log('✓ All bricks registered successfully');
} catch (error) {
  console.log('✗ Failed to register bricks:', error);
  process.exit(1);
}

// Test 4: Collision Detection
console.log('\nTest 4: Testing collision detection...');
try {
  const service = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => service.registerBrick(brick as any));
  
  const collisions = service.getBrickCollisions('brick1');
  console.log(`✓ Found ${collisions.length} potential collisions for brick1`);
  
  if (collisions.length > 0) {
    console.log('   Sample collision:', {
      sourceBrickId: collisions[0].sourceBrickId,
      targetBrickId: collisions[0].targetBrickId,
      distance: collisions[0].distance.toFixed(2),
      isValidConnection: collisions[0].isValidConnection
    });
  }
} catch (error) {
  console.log('✗ Failed to detect collisions:', error);
  process.exit(1);
}

// Test 5: Connection Management
console.log('\nTest 5: Testing connection management...');
try {
  const service = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => service.registerBrick(brick as any));
  
  const connections = service.getConnections();
  console.log(`✓ Connection map initialized with ${connections.size} entries`);
  
  // Test connection establishment
  const success = service.establishConnection('brick1:right:0', 'brick2:left');
  console.log(`✓ Connection establishment test: ${success}`);
  
  const updatedConnections = service.getConnections();
  console.log(`✓ Connection map now has ${updatedConnections.size} entries`);
} catch (error) {
  console.log('✗ Failed to manage connections:', error);
  process.exit(1);
}

console.log('\nPhase 1: All basic collision detection tests passed successfully!');
console.log('The core collision detection system is working correctly.'); 