import React, { useState, useEffect } from 'react';
import CategoryGrid from './categoryGrid';
import {
  PaletteMode,
  getCategories as getPaletteCategories,
  type CategoryConfig,
} from './categories';

interface SidebarProps {
  selected?: string;
  onSelect: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
}

interface ToolbarProps {
  onModeChange: (mode: PaletteMode) => void;
  currentMode: PaletteMode;
}

/**
 * Toolbar
 */
const Toolbar: React.FC<ToolbarProps> = ({ onModeChange, currentMode }) => (
  <div className="palette-toolbar">
    <button
      title="Music"
      className={currentMode === 'music' ? 'active' : ''}
      onClick={() => onModeChange('music')}
    >
      🎵
    </button>
    <button
      title="Flow"
      className={currentMode === 'flow' ? 'active' : ''}
      onClick={() => onModeChange('flow')}
    >
      🔄
    </button>
    <button
      title="Graphics"
      className={currentMode === 'graphics' ? 'active' : ''}
      onClick={() => onModeChange('graphics')}
    >
      🎨
    </button>
  </div>
);

/**
 * SearchBox
 */
const SearchBox: React.FC<{
  query: string;
  setQuery: (q: string) => void;
}> = ({ query, setQuery }) => (
  <div className="palette-search">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search"
      aria-label="Search blocks"
    />
  </div>
);

/**
 * Sidebar
 */
const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect, query, setQuery }) => {
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('music');

  const handleModeChange = (mode: PaletteMode) => {
    setPaletteMode(mode);
  };

  return (
    <div className="palette-sidebar">
      <Toolbar currentMode={paletteMode} onModeChange={handleModeChange} />
      <SearchBox query={query} setQuery={setQuery} />
      <CategoryGrid selected={selected} onSelect={onSelect} mode={paletteMode} />
    </div>
  );
};

export default Sidebar;
