import React, { useState } from 'react';
import { Palette } from '../../../src/palette/palette';
import { sampleConfig } from '../../../src/palette/data/sampleConfig';
import WorkSpaceView from '../../../src/workspace/view/components/WorkspaceView';

export default function App() {
  const [showCollisionTest, setShowCollisionTest] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Palette sidebar */}
      <aside
        style={{
          width: 280,
          height: '100%',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <Palette config={sampleConfig} />
        </div>

        {/* Collision Test Button */}
        <div
          style={{
            padding: '20px 0px',
            borderTop: '1px solid #ddd',
            background: '#f8f9fa',
          }}
        >
          <button
            onClick={() => setShowCollisionTest(true)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Test Collision Detection
          </button>
        </div>
      </aside>

      {/* Playground canvas */}
      <WorkSpaceView />
    </div>
  );
}
