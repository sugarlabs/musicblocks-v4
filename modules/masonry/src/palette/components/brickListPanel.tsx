import React, { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { defaultCategories as categories, PaletteMode } from '../utils/categories';

import bricksData from '../config/brick-config.json';
import type { BrickConfig } from '../utils/types';
import { brickViews } from './registry';
import '../palette.css';
import flow from '../assets/icons/flow.svg';
import music from '../assets/icons/music.svg';
import graphics from '../assets/icons/graphics.svg';

import { useDrag } from '@react-aria/dnd';
import { useSetRecoilState } from 'recoil';
import { dragStateAtom } from '../../state/dragState';

interface BrickListPanelProps {
  categoryId: string;
  query: string;
  mode: PaletteMode;
  onModeChange: (mode: PaletteMode) => void;
  onClose: () => void;
  onCategoryInView?: (categoryId: string) => void;
}

const bricks: BrickConfig[] = (bricksData as BrickConfig[]).map((b) => ({
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
  categoryId,
  query,
  mode,
  onModeChange,
  onClose,
  onCategoryInView,
}) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedBrick, setSelectedBrick] = useState<BrickConfig | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const brickListRef = useRef<HTMLDivElement>(null);
  const [draggedBrick, setDraggedBrick] = useState<BrickConfig | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const filteredBricks = useMemo(() => {
    return bricks.filter((brick) => {
      const brickLabel = brick.label || '';
      return brickLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, bricks]);

  const handleScroll = useCallback(() => {}, []);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return () => {};
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const mostVisibleEntry = visibleEntries.reduce((prev, current) => {
            return prev.intersectionRatio > current.intersectionRatio ? prev : current;
          });

          const category = (mostVisibleEntry.target as HTMLElement).dataset.category;
          if (category && category !== categoryId && onCategoryInView) {
            onCategoryInView(category);
          }
        }
      },
      {
        root: container,
        threshold: 0.1,
        rootMargin: '0px 0px -70% 0px',
      },
    );

    observerRef.current = observer;

    const categoryElements = container.querySelectorAll('[data-category]');
    categoryElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [categoryId, onCategoryInView]);

  useEffect(() => {
    const container = containerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;

    const categoryElements = container.querySelectorAll('[data-category]');
    categoryElements.forEach((el) => observer.observe(el));
  }, [filteredBricks]);

  // Mouse move and up handlers for global drag
  useEffect(() => {
    if (!draggedBrick) return;
    const handleMouseMove = (e: MouseEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => {
      setDraggedBrick(null);
      setDragPos(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedBrick]);

  const handleBrickClick = useCallback((brick: BrickConfig) => {
    setSelectedBrick(brick);
    setIsDetailView(true);
  }, []);

  const groupedBricks = useMemo(() => {
    if (searchQuery.trim() === '') {
      const grouped = groupBricksByCategory(bricks);
      return grouped;
    } else {
      return groupBricksByCategory(filteredBricks);
    }
  }, [filteredBricks, searchQuery, bricks]);

  const AsyncBrickView = React.memo(
    ({ brick, onClick }: { brick: BrickConfig; onClick: (brick: BrickConfig) => void }) => {
      const [BrickComponent, setBrickComponent] = React.useState<React.FC<BrickConfig> | null>(
        null,
      );
      const [error, setError] = React.useState<unknown>(null);

      useEffect(() => {
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
            if (isMounted) {
              if (err instanceof Error) {
                setError(err);
              } else {
                setError(new Error('An unknown error occurred'));
              }
            }
          }
        };

        loadBrick();

        return () => {
          isMounted = false;
        };
      }, [brick.id, brick.type]);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return (
          <div className="brick-default">
            <div className="brick-name">Error loading brick</div>
            <div className="brick-description">{errorMessage}</div>
          </div>
        );
      }

      if (error) {
        return <div className="brick-item">Error loading brick: {String(error)}</div>;
      }

      if (!BrickComponent) {
        return <div className="brick-item">Loading...</div>;
      }

      return (
        <div className="brick-item" onClick={() => onClick(brick)}>
          <Suspense fallback={<div>Loading...</div>}>
            <BrickComponent {...brick} />
          </Suspense>
        </div>
      );
    },
    (prevProps, nextProps) => prevProps.brick.id === nextProps.brick.id && prevProps.onClick === nextProps.onClick
  );

  return (
    <div className="brick-panel">
      <div className="brick-panel-header">
        <div className="mode-toggle-container">
          <button
            className={`mode-button ${mode === 'music' ? 'active' : ''}`}
            onClick={() => onModeChange('music')}
            title="Music"
          >
            <img src={music} alt="Flow Icon" style={{ width: '24px', height: '24px' }} />
          </button>
          <button
            className={`mode-button ${mode === 'flow' ? 'active' : ''}`}
            onClick={() => onModeChange('flow')}
            title="Flow"
          >
            <img src={flow} alt="Flow Icon" style={{ width: '24px', height: '24px' }} />
          </button>
          <button
            className={`mode-button ${mode === 'graphics' ? 'active' : ''}`}
            onClick={() => onModeChange('graphics')}
            title="Graphics"
          >
            <img src={graphics} alt="Flow Icon" style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
      </div>
      <div className="brick-search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const newQuery = e.target.value;
            setSearchQuery(newQuery);
            if (onCategoryInView) {
              onCategoryInView('');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              input.blur();
            }
          }}
          placeholder="Search bricks..."
          className="brick-search-input"
          aria-label="Search bricks"
        />
      </div>
      <div className="brick-list" ref={containerRef}>
        {Object.entries(groupedBricks).map(
          ([category, categoryBricks]: [string, BrickConfig[]]) => (
            <div key={category} className="brick-category" data-category={category}>
              <div className="category-header-wrapper" data-category={category}>
                <h4 className="category-header">{category}</h4>
              </div>
              <div className="brick-category-list">
                {categoryBricks.map((brick) => {
                  const setDrag = useSetRecoilState(dragStateAtom);
                  const { dragProps } = useDrag({
                    getItems() {
                      return [
                        {
                          'application/json': JSON.stringify({
                            brickType: brick.type,
                            origin: 'palette',
                          }),
                        },
                      ];
                    },
                  });

                  return (
                    <div
                      key={brick.id}
                      className="brick-item"
                      draggable
                      onDragStart={(e) => {
                        // Find the SVG element inside the brick item
                        const svg = e.currentTarget.querySelector('svg');
                        if (svg) {
                          // Clone the SVG for a cleaner drag image
                          const clone = svg.cloneNode(true);
                          (clone as SVGElement).style.position = 'absolute';
                          (clone as SVGElement).style.top = '-9999px';
                          document.body.appendChild(clone);
                          const width = (clone as SVGSVGElement).width.baseVal.value || 40;
                          const height = (clone as SVGSVGElement).height.baseVal.value || 40;
                          e.dataTransfer.setDragImage(clone as Element, width / 2, height / 2);
                          setTimeout(() => document.body.removeChild(clone), 0);
                        }
                        e.dataTransfer.setData('application/json', JSON.stringify({ brickId: brick.id }));
                        e.dataTransfer.effectAllowed = 'copy';
                        setDrag({ brickType: brick.type, origin: 'palette' });
                      }}
                    >
                      {/* Directly render the brick component from the registry */}
                      {(() => {
                        const BrickComponent = brickViews[brick.type];
                        return BrickComponent ? <BrickComponent {...brick} /> : null;
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        )}
        {/* Floating SVG brick during drag */}
        {draggedBrick && dragPos && (
          <div
            style={{
              position: 'fixed',
              left: dragPos.x + 8,
              top: dragPos.y + 8,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <Suspense fallback={<div />}>{
              (() => {
                const BrickComponent = brickViews[draggedBrick.type];
                return BrickComponent ? <BrickComponent {...draggedBrick} /> : null;
              })()
            }</Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

const AsyncBrickView = React.memo(
  ({ brick, onClick }: { brick: BrickConfig; onClick: (brick: BrickConfig) => void }) => {
    const [BrickComponent, setBrickComponent] = React.useState<React.FC<BrickConfig> | null>(null);
    const [error, setError] = React.useState<unknown>(null);

    useEffect(() => {
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
          if (isMounted) {
            if (err instanceof Error) {
              setError(err);
            } else {
              setError(new Error('An unknown error occurred'));
            }
          }
        }
      };

      loadBrick();

      return () => {
        isMounted = false;
      };
    }, [brick.id, brick.type]);

    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return (
        <div className="brick-default">
          <div className="brick-name">Error loading brick</div>
          <div className="brick-description">{errorMessage}</div>
        </div>
      );
    }

    if (error) {
      return <div className="brick-item">Error loading brick: {String(error)}</div>;
    }

    if (!BrickComponent) {
      return <div className="brick-item">Loading...</div>;
    }

    return (
      <div className="brick-item" onClick={() => onClick(brick)}>
        <Suspense fallback={<div>Loading...</div>}>
          <BrickComponent {...brick} />
        </Suspense>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.brick.id === nextProps.brick.id && prevProps.onClick === nextProps.onClick
);

export default BrickListPanel;
