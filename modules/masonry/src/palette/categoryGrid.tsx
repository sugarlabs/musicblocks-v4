// src/palette/CategoryGrid.tsx
import React from 'react';
import { getCategories, PaletteMode } from './categories';

interface Props {
  /** Called when a category is selected */
  onSelect: (id: string) => void;
  /** Currently selected category ID */
  selected?: string;
  /** Current palette mode */
  mode: PaletteMode;
}

/**
 * CategoryGrid
 * Renders a vertical list of category buttons
 */
const CategoryGrid: React.FC<Props> = ({ onSelect, selected, mode }) => {
  const categories = getCategories(mode);

  return (
    <div className="category-grid">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`category-button ${selected === category.id ? 'selected' : ''}`}
          style={{
            backgroundColor: category.color,
            color: 'white',
          }}
          aria-label={category.label}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
