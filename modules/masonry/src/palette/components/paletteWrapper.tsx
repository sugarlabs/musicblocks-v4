import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PaletteMode } from '../utils/categories';
import Sidebar from './sidebar';
import BrickListPanel from './brickListPanel';
import '../palette.css';

const PaletteWrapper: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('RHYTHM');
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('music');
  const [query, setQuery] = useState<string>('');
  const prevSelectedCategory = useRef<string>('RHYTHM');
  const isCategoryChangeFromScroll = useRef(false);

  const handleCategorySelect = useCallback((categoryId: string) => {
    if (!isCategoryChangeFromScroll.current) {
      setSelectedCategory(categoryId);
    }
    isCategoryChangeFromScroll.current = false;
  }, []);

  const handleCategoryInView = useCallback((categoryId: string) => {
    isCategoryChangeFromScroll.current = true;
    setSelectedCategory(categoryId);
  }, []);

  const handleModeChange = useCallback((mode: PaletteMode) => {
    setPaletteMode(mode);
    // Reset to default category when changing modes
    setSelectedCategory('RHYTHM');
  }, []);

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (newQuery) {
        prevSelectedCategory.current = selectedCategory;
      } else {
        setSelectedCategory(prevSelectedCategory.current);
      }
    },
    [selectedCategory],
  );

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedCategory('RHYTHM');
    }
  }, [selectedCategory]);

  return (
    <>
      {/* Primary Palette */}
      <div className="palette-container">
        <Sidebar
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          query={query}
          onQueryChange={handleQueryChange}
          mode={paletteMode}
          onModeChange={handleModeChange}
        />
      </div>

      {/* BrickList Panel  */}
      <div className="brick-list-container">
        <BrickListPanel
          categoryId={selectedCategory}
          query={query}
          mode={paletteMode}
          onModeChange={handleModeChange}
          onClose={() => {}}
          onCategoryInView={handleCategoryInView}
        />
      </div>
    </>
  );
};

export default PaletteWrapper;
