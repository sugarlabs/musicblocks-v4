import React, { useState, useEffect } from 'react';
import CategoryGrid from './categoryGrid';
import {
  PaletteMode,
  getCategories as getPaletteCategories,
  type CategoryConfig,
} from '../utils/categories';
// Inline SVG for the music icon
const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="55" height="55" rx="0" fill="#1A0CFF"/>
    <g transform="matrix(0.87134744,0,0,0.87134744,3.2573019,3.5379454)">
      <g transform="matrix(2.8153153,0,0,2.8153153,175.99125,78.011244)">
        <path d="m-61.801691,-12.829594 q 0,-0.832 0.816,-1.472 0.816,-0.656 1.728,-0.656 0.528,0 0.944,0.272 l 0,-9.472 0.352,0 0,10.352 q 0,0.896 -0.784,1.488 -0.784,0.592 -1.728,0.592 -0.528,0 -0.928,-0.304 -0.4,-0.32 -0.4,-0.8 z m 0.736,0.48 q 0.848,0 1.712,-0.72 0.88,-0.72 0.88,-1.072 0,-0.224 -0.192,-0.224 -0.592,0 -1.632,0.688 -1.024,0.672 -1.024,1.12 0,0.208 0.256,0.208 z" fill="#F9F9F9"/>
      </g>
      <g>
        <path d="m 28.250009,41.891892 q 0,-2.342343 2.297297,-4.144145 2.297298,-1.846846 4.864865,-1.846846 1.486487,0 2.657658,0.765765 l 0,-26.666666 0.990991,0 0,29.144144 q 0,2.522522 -2.207207,4.189189 Q 34.646405,45 31.988749,45 30.502261,45 29.376135,44.144144 28.250009,43.243243 28.250009,41.891892 Z" fill="#F9F9F9"/>
      </g>
      <g>
        <path d="m 42.833345,41.891892 q 0,-2.342343 2.297297,-4.144145 2.297298,-1.846846 4.864865,-1.846846 1.486487,0 2.657658,0.765765 l 0,-26.666666 0.990991,0 0,29.144144 q 0,2.522522 -2.207208,4.189189 Q 49.229741,45 46.572085,45 45.085597,45 43.959471,44.144144 42.833345,43.243243 42.833345,41.891892 Z" fill="#F9F9F9"/>
      </g>
    </g>
  </svg>
);

interface SidebarProps {
  selected?: string;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  mode: PaletteMode;
  onModeChange: (mode: PaletteMode) => void;
}

interface ToolbarProps {
  onModeChange: (mode: PaletteMode) => void;
  currentMode: PaletteMode;
}

/**
 * Toolbar
 */
const Toolbar: React.FC<ToolbarProps> = ({ onModeChange, currentMode }) => (
  <div className="mode-toggle-container">
    <button
      title="Music"
      className={`mode-button ${currentMode === 'music' ? 'active' : ''}`}
      onClick={() => onModeChange('music')}
    >
      <span className="icon">
        <MusicIcon />
      </span>
      <span>Code</span>
    </button>
    <button
      title="Flow"
      className={`mode-button ${currentMode === 'flow' ? 'active' : ''}`}
      onClick={() => onModeChange('flow')}
    >
      <span className="icon">🔄</span>
      <span>Costumes</span>
    </button>
    <button
      title="Graphics"
      className={`mode-button ${currentMode === 'graphics' ? 'active' : ''}`}
      onClick={() => onModeChange('graphics')}
    >
      <span className="icon"></span>
      <span>Sounds</span>
    </button>
  </div>
);

/**
 * Sidebar
 */
const Sidebar: React.FC<SidebarProps> = ({
  selected,
  onSelect,
  query,
  onQueryChange,
  mode,
  onModeChange,
}) => {
  return (
    <div className="palette-sidebar">
      <CategoryGrid selected={selected} onSelect={onSelect} mode={mode} />
    </div>
  );
};

export default Sidebar;
