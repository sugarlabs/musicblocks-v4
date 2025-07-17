/**
 * WorkspaceCanvas.tsx
 *
 * Renders the main SVG-based workspace for placing and dragging towers of bricks.
 * Supports drag-and-drop from a palette and pointer-based dragging of individual bricks.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { dragStateAtom } from '../../../src/state/dragState';
import { towersAtom } from '../../../src/state/towersState';
import TowerModel from '../../../src/tower/model/model';
import type { BrickConfig } from '../../../src/palette/utils/types';
import bricksData from '../../../src/palette/config/brick-config.json';
import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
} from '../../../src/brick/utils/brickFactory';
import { v4 as uuid } from 'uuid';
import TowerView from '../../../src/tower/view/components/TowerView';
import { JSX } from 'react/jsx-runtime';

/**
 * WorkspaceCanvas
 * @returns JSX.Element
 *
 * The top-level canvas component. Manages:
 *  - Recoil state for towers and drag origin
 *  - Drag-and-drop of new bricks from the palette
 *  - Pointer-based dragging of placed bricks
 */
export default function WorkspaceCanvas(): JSX.Element {
  const { origin } = useRecoilValue(dragStateAtom);
  const [towers, setTowers] = useRecoilState(towersAtom);
  const [isOver, setIsOver] = useState(false);
  const [draggedBrickId, setDraggedBrickId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Compute argument box sizes for a given brick config
   * @param cfg Brick configuration with argCount
   * @returns Array of { w: number; h: number } objects
   */
  const makeArgs = (cfg: BrickConfig) =>
    cfg.argCount > 0 ? Array(cfg.argCount).fill({ w: 20, h: 20 }) : [];

  /**
   * Handle drag-over event on the workspace container
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return; // only accept from palette
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  /**
   * Handle drop event: create a new TowerModel at drop coords
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return;
    e.preventDefault();
    setIsOver(false);

    // Extract brickId from dataTransfer
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const { brickId } = JSON.parse(raw) as { brickId: string };

    // Find config for the dropped brick
    const cfg = (bricksData as BrickConfig[]).find((b) => b.id === brickId);
    if (!cfg) return;

    // Compute drop coordinates inside the div
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create brick via factory methods
    let brick;
    switch (cfg.type) {
      case 'simple':
        brick = createSimpleBrick({
          label: cfg.label,
          colorBg: cfg.color,
          bboxArgs: makeArgs(cfg),
          topNotch: cfg.notches.top,
          bottomNotch: cfg.notches.bottom,
          tooltip: cfg.id,
        });
        break;
      case 'expression':
        brick = createExpressionBrick({
          label: cfg.label,
          colorBg: cfg.color,
          bboxArgs: makeArgs(cfg),
          tooltip: cfg.id,
        });
        break;
      case 'compound':
        brick = createCompoundBrick({
          label: cfg.label,
          colorBg: cfg.color,
          bboxArgs: makeArgs(cfg),
          bboxNest: [],
          topNotch: cfg.notches.top,
          bottomNotch: cfg.notches.bottom,
          tooltip: cfg.id,
        });
        break;
      default:
        return;
    }

    // Instantiate and add to towers state
    const tower = new TowerModel(uuid(), brick, { x, y });
    setTowers([...towers, tower]);
  };

  /**
   * Handle pointer movement while dragging a brick
   */
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!draggedBrickId) return;
    const svg = svgRef.current;
    if (!svg) return;

    // Calculate new position relative to SVG
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    // Update the specific brick's position
    const towersCopy = [...towers];
    const towerModel = towersCopy.find((t) => t.hasBrick(draggedBrickId));
    if (towerModel) {
      towerModel.setBrickPosition(draggedBrickId, { x, y });
      setTowers(towersCopy);
      setRefreshKey((k) => k + 1);
    }
  };

  /**
   * Stop dragging: cleanup state and listeners
   */
  const handleMouseUp = () => {
    setDraggedBrickId(null);
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  };

  /**
   * Attach/detach global listeners when isDragging changes
   */
  useEffect(() => {
    let animationFrameId: number;
    const animate = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        handleMouseMove(e);
      });
    };
    if (isDragging) {
      window.addEventListener('mousemove', animate);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', animate);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  /**
   * Initiate global drag listeners (alternative to useEffect)
   */
  const startGlobalDrag = () => {
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp as any);
  };

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        outline: isOver ? '2px dashed #08f' : 'none',
      }}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: 'all' }}
      >
        {towers.map((t) => (
          <TowerView
            key={t.id + '-' + refreshKey}
            tower={t}
            draggedBrickId={draggedBrickId}
            setDraggedBrickId={setDraggedBrickId}
            dragOffset={dragOffset}
            setDragOffset={setDragOffset}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            svgRef={svgRef as React.RefObject<SVGSVGElement>}
          />
        ))}
      </svg>
    </div>
  );
}
