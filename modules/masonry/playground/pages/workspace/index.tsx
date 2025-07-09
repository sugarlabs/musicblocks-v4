import React from 'react';
import PaletteWrapper from '../../../src/palette/components/paletteWrapper';
import '../../../src/palette/palette.css';
import WorkspaceCanvas from './WorkspaceCanvas';

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Palette sidebar */}
      <aside
        style={{
          width: 280,
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
        }}
      >
        <PaletteWrapper/>

      </aside>

      {/* Playground canvas */}
      <WorkspaceCanvas />
    </div>
  );
}
