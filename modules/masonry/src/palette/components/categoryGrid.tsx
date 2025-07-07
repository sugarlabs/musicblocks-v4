// src/palette/CategoryGrid.tsx
import React, { useEffect, useRef } from 'react';
import '../palette.css';
import { getCategories, PaletteMode } from '../utils/categories';

interface Props {
  onSelect: (id: string) => void;
  selected?: string;
  mode: PaletteMode;
}

/**
 * CategoryGrid
 * Renders a grid of category buttons with circular icons
 */
const CategoryGrid: React.FC<Props> = ({ onSelect, selected, mode }) => {
  const categories = getCategories(mode);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!container) return;
      const scrollSpeed = 14;
      container.scrollTop += e.deltaY * scrollSpeed;
      e.preventDefault();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedEl = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      const selectedCenter = selectedRect.top + selectedRect.height / 2;

      if (selectedRect.top < containerRect.top || selectedRect.bottom > containerRect.bottom) {
        container.scrollTo({
          top: selectedEl.offsetTop - container.offsetHeight / 2 + selectedEl.offsetHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [selected]);

  return (
    <div
      className="category-grid"
      ref={containerRef}
      style={{
        cursor: 'grab',
        userSelect: 'none',
      }}
      onMouseDown={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
      }}
      onMouseUp={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }
      }}
      onMouseLeave={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }
      }}
    >
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`category-button ${selected === category.id ? 'active' : ''}`}
          style={{ '--category-color': category.color } as React.CSSProperties}
          onClick={() => onSelect(category.id)}
          ref={selected === category.id ? selectedRef : null}
        >
          <div className="icon-circle" style={{ backgroundColor: category.color }} />
          <span className="label">{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
