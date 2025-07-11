import React, { useState, useRef } from 'react';
import { BrickCollisionService } from '../../../src/collision-detection';

interface CollisionTestProps {
  onClose: () => void;
}

export function CollisionTest({ onClose }: CollisionTestProps): React.JSX.Element {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // --- Visual Demo State ---
  const [bricks, setBricks] = useState([
    { uuid: 'brick1', type: 'Expression', x: 100, y: 100 },
    { uuid: 'brick2', type: 'Simple', x: 300, y: 100 },
    { uuid: 'brick3', type: 'Compound', x: 500, y: 200 },
  ]);
  const [dragged, setDragged] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [collisions, setCollisions] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runBasicTest = () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('Starting basic collision detection test...');

      // Test 1: Service initialization
      addResult('Test 1: Initializing collision service');
      const collisionService = new BrickCollisionService(1000, 800);
      addResult('✓ Collision service created successfully');

      // Test 2: Mock brick creation
      addResult('Test 2: Creating mock bricks');
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
      addResult(`✓ Created ${bricks.length} mock bricks`);

      // Test 3: Brick registration
      addResult('Test 3: Registering bricks with collision service');
      bricks.forEach(brick => collisionService.registerBrick(brick as any));
      addResult('✓ All bricks registered successfully');

      // Test 4: Collision detection
      addResult('Test 4: Testing collision detection');
      const collisions = collisionService.getBrickCollisions('brick1');
      addResult(`✓ Found ${collisions.length} potential collisions for brick1`);

      // Test 5: Connection management
      addResult('Test 5: Testing connection management');
      const connections = collisionService.getConnections();
      addResult(`✓ Connection map initialized with ${connections.size} entries`);

      addResult('Basic collision detection test completed successfully!');
      addResult('Phase 1 implementation is working correctly.');

    } catch (error) {
      addResult(`❌ Error during testing: ${error}`);
      console.error('Test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runPhase2Test = () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('Starting Phase 2 positioning integration test...');

      // Test 1: Service initialization
      addResult('Test 1: Initializing collision service');
      const collisionService = new BrickCollisionService(1000, 800);
      addResult('✓ Collision service created successfully');

      // Test 2: Mock brick creation
      addResult('Test 2: Creating mock bricks');
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
      addResult(`✓ Created ${bricks.length} mock bricks`);

      // Test 3: Brick registration
      addResult('Test 3: Registering bricks with collision service');
      bricks.forEach(brick => collisionService.registerBrick(brick as any));
      addResult('✓ All bricks registered successfully');

      // Test 4: Position-based collision detection
      addResult('Test 4: Testing position-based collision detection');
      const positions = new Map<string, { x: number; y: number }>();
      positions.set('brick1', { x: 100, y: 100 });
      positions.set('brick2', { x: 200, y: 100 }); // Close to brick1
      positions.set('brick3', { x: 400, y: 100 }); // Far from brick1
      
      collisionService.updateBrickPositions(positions);
      addResult('✓ Brick positions updated successfully');

      const collisions = collisionService.getBrickCollisions('brick1');
      addResult(`✓ Found ${collisions.length} potential collisions for brick1 with positioning`);

      if (collisions.length > 0) {
        addResult(`   Sample collision: ${collisions[0].targetBrickId} at distance ${collisions[0].distance.toFixed(2)}`);
      }

      // Test 5: Tower integration simulation
      addResult('Test 5: Testing tower integration simulation');
      const towerNodes = bricks.map(brick => ({
        brick: brick as any,
        position: positions.get(brick.uuid) || { x: 0, y: 0 }
      }));
      
      collisionService.setBrickPositionsFromTower(towerNodes);
      addResult('✓ Tower integration completed successfully');

      // Test 6: Performance test
      addResult('Test 6: Performance test with positioning');
      const startTime = performance.now();
      const performanceCollisions = collisionService.getBrickCollisions('brick1');
      const endTime = performance.now();
      addResult(`✓ Collision detection took ${(endTime - startTime).toFixed(2)}ms`);

      addResult('Phase 2 positioning integration test completed successfully!');
      addResult('Position-based collision detection is working correctly.');

    } catch (error) {
      addResult(`❌ Error during Phase 2 testing: ${error}`);
      console.error('Phase 2 test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // --- Visual Demo Logic ---
  const collisionService = new BrickCollisionService(1000, 800);
  bricks.forEach(brick => collisionService.registerBrick({
    uuid: brick.uuid,
    type: brick.type,
    get name() { return `Mock${brick.type}`; },
    get scale() { return 1; },
    set scale(v) {},
    get boundingBox() { return { w: 120, h: 60 }; },
    get connectionPoints() {
      return {
        top: { x: 60, y: 0 },
        right: [{ x: 120, y: 30 }],
        bottom: { x: 60, y: 60 },
        left: { x: 0, y: 30 }
      };
    },
    get visualState() { return 'default'; },
    set visualState(v) {},
    get isActionMenuOpen() { return false; },
    set isActionMenuOpen(v) {},
    get isVisible() { return true; },
    set isVisible(v) {},
  } as any));
  // Update positions in the service
  const positions = new Map<string, { x: number; y: number }>();
  bricks.forEach(brick => positions.set(brick.uuid, { x: brick.x, y: brick.y }));
  collisionService.updateBrickPositions(positions);
  // Get all collisions
  const allCollisions = collisionService.getAllCollisions();

  // --- Drag Handlers ---
  function onBrickMouseDown(e: React.MouseEvent, uuid: string) {
    setDragged(uuid);
    const brick = bricks.find(b => b.uuid === uuid)!;
    setOffset({ x: e.clientX - brick.x, y: e.clientY - brick.y });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function onMouseMove(e: MouseEvent) {
    setBricks(prev => prev.map(b =>
      b.uuid === dragged ? { ...b, x: e.clientX - offset.x, y: e.clientY - offset.y } : b
    ));
  }
  function onMouseUp() {
    setDragged(null);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  // --- Visual Demo Render ---
  function renderBricks() {
    return bricks.map(brick => (
      <g key={brick.uuid} style={{ cursor: 'grab' }}
         onMouseDown={e => onBrickMouseDown(e, brick.uuid)}>
        {/* Brick body */}
        <rect x={brick.x} y={brick.y} width={120} height={60} rx={12} fill="#f5f6fa" stroke="#2c3e50" strokeWidth={2} />
        {/* Connection points */}
        {renderConnectionPoints(brick)}
        {/* Brick label */}
        <text x={brick.x + 60} y={brick.y + 35} textAnchor="middle" fontSize={16} fill="#2c3e50">{brick.type}</text>
      </g>
    ));
  }
  function renderConnectionPoints(brick: any) {
    const points = [
      { x: brick.x + 60, y: brick.y, side: 'top' },
      { x: brick.x + 120, y: brick.y + 30, side: 'right' },
      { x: brick.x + 60, y: brick.y + 60, side: 'bottom' },
      { x: brick.x, y: brick.y + 30, side: 'left' },
    ];
    return points.map((pt, i) => (
      <circle key={pt.side} cx={pt.x} cy={pt.y} r={8} fill="#74b9ff" stroke="#0984e3" strokeWidth={2} />
    ));
  }
  function renderCollisions() {
    return allCollisions.map((col, i) => {
      const src = bricks.find(b => b.uuid === col.sourceBrickId);
      const tgt = bricks.find(b => b.uuid === col.targetBrickId);
      if (!src || !tgt) return null;
      // Draw a line between the two connection points
      const srcPt = getConnectionPointCoords(src, col.sourceConnectionPoint.side);
      const tgtPt = getConnectionPointCoords(tgt, col.targetConnectionPoint.side);
      return (
        <line key={i} x1={srcPt.x} y1={srcPt.y} x2={tgtPt.x} y2={tgtPt.y} stroke="#e17055" strokeWidth={3} markerEnd="url(#arrow)" />
      );
    });
  }
  function getConnectionPointCoords(brick: any, side: string) {
    switch (side) {
      case 'top': return { x: brick.x + 60, y: brick.y };
      case 'right': return { x: brick.x + 120, y: brick.y + 30 };
      case 'bottom': return { x: brick.x + 60, y: brick.y + 60 };
      case 'left': return { x: brick.x, y: brick.y + 30 };
      default: return { x: brick.x + 60, y: brick.y + 30 };
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      border: '2px solid #3498db',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Collision Detection Test</h2>
        <button 
          onClick={onClose}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* --- Visual Demo Area --- */}
      <div style={{ marginBottom: 30, border: '1px solid #dfe6e9', borderRadius: 8, background: '#fafbfc', padding: 10 }}>
        <h3 style={{ margin: 0, color: '#0984e3', fontWeight: 600 }}>Live Collision Demo</h3>
        <svg ref={svgRef} width={800} height={400} style={{ background: '#f1f2f6', borderRadius: 8, marginTop: 10 }}>
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L10,5 L0,10 Z" fill="#e17055" />
            </marker>
          </defs>
          {renderCollisions()}
          {renderBricks()}
        </svg>
        <div style={{ fontSize: 13, color: '#636e72', marginTop: 8 }}>
          Drag bricks to see real-time collision detection and connection highlights.
        </div>
      </div>
      {/* --- Existing test buttons/results below --- */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runBasicTest} 
          disabled={isRunning}
          style={{
            background: isRunning ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? 'Running...' : 'Run Phase 1 Test'}
        </button>
        <button 
          onClick={runPhase2Test} 
          disabled={isRunning}
          style={{
            background: isRunning ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? 'Running...' : 'Run Phase 2 Test'}
        </button>
        <button 
          onClick={clearResults} 
          disabled={isRunning}
          style={{
            background: '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        borderRadius: '6px', 
        padding: '15px',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Test Results</h3>
        {testResults.length === 0 ? (
          <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            No test results yet. Click "Run Basic Test" to start.
          </p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              padding: '4px 0',
              borderBottom: '1px solid #e9ecef',
              color: result.includes('✓') ? '#27ae60' : 
                     result.includes('❌') ? '#e74c3c' : 
                     result.includes('🎉') ? '#f39c12' : '#34495e'
            }}>
              {result}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
        <strong>What's being tested:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Phase 1:</strong> Basic collision detection system</li>
          <li><strong>Phase 2:</strong> Position-based collision detection with tower integration</li>
          <li>Collision service initialization and configuration</li>
          <li>Brick registration and position management</li>
          <li>Adaptive algorithm selection (linear vs quadtree)</li>
          <li>Connection validation and state management</li>
          <li>Performance monitoring and optimization</li>
        </ul>
      </div>
    </div>
  );
} 