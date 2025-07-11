import React, { useState } from 'react';
import WorkspaceApp from './pages/workspace/index';
import CollisionMapApp from './pages/collision-map';

export default function App() {
  const [tab, setTab] = useState<'workspace' | 'collision'>('workspace');

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed top-right tab bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          background: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          borderLeft: '1px solid #ddd',
          borderRadius: '0 0 0 12px',
          boxShadow: '0 2px 8px #dfe6e9',
        }}
      >
        <button
          onClick={() => setTab('workspace')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: tab === 'workspace' ? '#3498db' : 'transparent',
            color: tab === 'workspace' ? 'white' : '#2c3e50',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: tab === 'workspace' ? '2px solid #2980b9' : 'none',
            outline: 'none',
            borderRadius: '0 0 0 12px',
          }}
        >
          Workspace
        </button>
        <button
          onClick={() => setTab('collision')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: tab === 'collision' ? '#e17055' : 'transparent',
            color: tab === 'collision' ? 'white' : '#2c3e50',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: tab === 'collision' ? '2px solid #d35400' : 'none',
            outline: 'none',
          }}
        >
          Collision Map
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === 'workspace' ? <WorkspaceApp /> : <CollisionMapApp />}
      </div>
    </div>
  );
} 