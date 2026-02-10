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
  const brickListContainerRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = useCallback((categoryId: string) => {
    // Always update the selected category
    setSelectedCategory(categoryId);
    
    // Set flag to true BEFORE scrolling to ignore IntersectionObserver events
    isCategoryChangeFromScroll.current = true;
    
    // Scroll to the selected category section
    if (brickListContainerRef.current) {
      const categoryElement = brickListContainerRef.current.querySelector(
        `[data-category="${categoryId}"]`
      );
      if (categoryElement) {
        categoryElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
    
    // Reset flag after scroll animation completes (smooth scroll takes ~500ms)
    setTimeout(() => {
      isCategoryChangeFromScroll.current = false;
    }, 600);
  }, []);

  const handleCategoryInView = useCallback((categoryId: string) => {
    // Only update if this is a real scroll event (not from our programmatic scroll)
    if (!isCategoryChangeFromScroll.current) {
      setSelectedCategory(categoryId);
    }
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
          containerRef={brickListContainerRef}
        />
      </div>
    </>
  );
};

export default PaletteWrapper;
