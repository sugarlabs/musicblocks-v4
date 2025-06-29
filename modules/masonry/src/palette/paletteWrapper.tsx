import React, { useState } from 'react';
import Sidebar from './sidebar';
import BrickListPanel from './brickListPanel';
import './palette.css';

const PaletteWrapper: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [showBrickPanel, setShowBrickPanel] = useState(false);
  const prevSelectedCategory = React.useRef<string | undefined>(undefined);

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setShowBrickPanel(!showBrickPanel);
    } else {
      setSelectedCategory(categoryId);
      setShowBrickPanel(true);
    }
  };

  const handleCloseBrickPanel = () => {
    setShowBrickPanel(false);
  };

  React.useEffect(() => {
    if (selectedCategory && selectedCategory !== prevSelectedCategory.current) {
      setShowBrickPanel(true);
    }
    prevSelectedCategory.current = selectedCategory;
  }, [selectedCategory]);

  return (
    <>
      {/* Primary Palette */}
      <div className="palette-container">
        <Sidebar
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          query={query}
          setQuery={setQuery}
        />
      </div>

      {/* Secondary Panel - Only show when a category is selected and panel is open */}
      {selectedCategory && showBrickPanel && (
        <div className="brick-list-container">
          <BrickListPanel
            selectedCategory={selectedCategory}
            onClose={handleCloseBrickPanel}
            filter={query}
          />
        </div>
      )}
    </>
  );
};

export default PaletteWrapper;
