import React, { useState } from 'react';
import WorkspaceApp from './pages/workspace/index';
import CollisionDetection from '../src/collision-detection/CollisionDetection';

export default function App() {
  const [tab, setTab] = useState<'workspace' | 'collision' | 'collision-detection'>('workspace');

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Top-right tab bar */}
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
          onClick={() => setTab('collision-detection')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: tab === 'collision-detection' ? '#e17055' : 'transparent',
            color: tab === 'collision-detection' ? 'white' : '#2c3e50',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: tab === 'collision-detection' ? '2px solid #d35400' : 'none',
            outline: 'none',
          }}
        >
          Collision Detection
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          marginTop: 48,
        }}
      >
        {tab === 'workspace' && <WorkspaceApp />}
        {tab === 'collision-detection' && <CollisionDetection />}
      </div>
    </div>
  );
}
