import React, { useEffect, useRef, useState, Suspense } from 'react';
import { defaultCategories as categories } from './categories';
import bricksData from './config/brick-config.json';
import type { BrickConfig } from './types';
import { brickViews } from './registry';
import './palette.css';

interface BrickListPanelProps {
  selectedCategory: string;
  onClose: () => void;
  filter?: string;
}

const bricks: BrickConfig[] = (bricksData as any[]).map((b) => ({
  ...b,
  argCount: b.argCount ?? 0,
}));

const groupBricksByCategory = (bricks: BrickConfig[]) => {
  const grouped: Record<string, BrickConfig[]> = {};
  bricks.forEach((brick) => {
    if (!grouped[brick.category]) {
      grouped[brick.category] = [];
    }
    grouped[brick.category].push(brick);
  });
  return grouped;
};

const BrickListPanel: React.FC<BrickListPanelProps> = ({
  selectedCategory,
  onClose,
  filter = '',
}) => {
  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [filteredBricks, setFilteredBricks] = useState<Record<string, BrickConfig[]>>({});

  useEffect(() => {
    const filtered = filter
      ? bricks.filter((brick) => brick.label.toLowerCase().includes(filter.toLowerCase()))
      : bricks;

    setFilteredBricks(groupBricksByCategory(filtered));
  }, [filter]);

  useEffect(() => {
    if (selectedCategory && containerRef.current) {
      const categoryElement = containerRef.current.querySelector(
        `[data-category="${selectedCategory}"]`,
      ) as HTMLElement;

      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedCategory]);

  return (
    <div className="brick-panel">
      <div className="brick-panel-header">
        <h3>Blocks</h3>
        <button
          className="close-button"
          onClick={handleClose}
          aria-label="Close panel"
          type="button"
        >
          ×
        </button>
      </div>
      <div className="brick-list" ref={containerRef}>
        {Object.entries(filteredBricks).map(([category, categoryBricks]) => (
          <div key={category} className="brick-category" data-category={category}>
            <h4 className="category-header">{category}</h4>
            <div className="brick-category-list">
              {categoryBricks.map((brick) => (
                <div key={brick.id} className="brick-item">
                  <Suspense fallback={<div>Loading brick...</div>}>
                    <AsyncBrickView brick={brick} />
                  </Suspense>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AsyncBrickView = ({ brick }: { brick: BrickConfig }) => {
  const [BrickComponent, setBrickComponent] = React.useState<React.FC<BrickConfig> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadBrick = async () => {
      try {
        const Component = brickViews[brick.type];
        if (!Component) {
          throw new Error(`No view found for brick type: ${brick.type}`);
        }

        if (isMounted) {
          setBrickComponent(() => Component);
        }
      } catch (err) {
        if (isMounted) setError(err as Error);
      }
    };

    loadBrick();

    return () => {
      isMounted = false;
    };
  }, [brick]);

  if (error) {
    return (
      <div className="brick-default">
        <div className="brick-name">Error loading brick</div>
        <div className="brick-description">{error.message}</div>
      </div>
    );
  }

  if (!BrickComponent) {
    return (
      <div className="brick-default">
        <div className="brick-name">Loading...</div>
      </div>
    );
  }

  return <BrickComponent {...brick} />;
};

export default BrickListPanel;
