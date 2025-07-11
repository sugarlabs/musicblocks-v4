import React, { useRef, useState } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { dragStateAtom } from '../../src/state/dragState';
import { towersAtom } from '../../src/state/towersState';
import TowerModel from '../../src/tower/model/model';
import type { BrickConfig } from '../../src/palette/utils/types';
import bricksData from '../../src/palette/config/brick-config.json';
import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
} from '../../src/brick/utils/brickFactory';
import { v4 as uuid } from 'uuid';
import PaletteWrapper from '../../src/palette/components/paletteWrapper';
import TowerView from '../../src/tower/view/components/TowerView';
import { BrickCollisionService } from '../../src/collision-detection';
import type { TPoint } from '../../src/@types/tower';
import type { CollisionResult } from '../../src/collision-detection/types';

export default function CollisionMapApp() {
  const { origin } = useRecoilValue(dragStateAtom);
  const [towers, setTowers] = useRecoilState(towersAtom);
  const [isOver, setIsOver] = useState(false);
  const [draggedBrickId, setDraggedBrickId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [collisionService] = React.useState(() => new BrickCollisionService(2000, 1500));
  const [collisions, setCollisions] = useState<CollisionResult[]>([]);

  const makeArgs = (cfg: BrickConfig) =>
    cfg.argCount > 0 ? Array(cfg.argCount).fill({ w: 20, h: 20 }) : [];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return;
    e.preventDefault();
    setIsOver(false);
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const { brickId } = JSON.parse(raw) as { brickId: string };
    const cfg = (bricksData as BrickConfig[]).find((b) => b.id === brickId);
    if (!cfg) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
    const tower = new TowerModel(uuid(), brick, { x, y });
    setTowers([...towers, tower]);
  };

  // Mouse move handler for dragging
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!draggedBrickId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    // Make a shallow copy to trigger React re-render
    const towersCopy = [...towers];
    const towerModel = towersCopy.find(t => t.hasBrick(draggedBrickId));
    if (towerModel) {
      towerModel.setBrickPosition(draggedBrickId, { x, y });
      setTowers(towersCopy); // This triggers a re-render on every move!
      setRefreshKey(k => k + 1); // Force re-render
    }
  };

  // Mouse up handler to stop dragging
  const handleMouseUp = () => {
    setDraggedBrickId(null);
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  };

  // Attach global listeners when dragging starts, using requestAnimationFrame
  React.useEffect(() => {
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
  }, [isDragging, handleMouseMove]);

  // Attach global listeners when dragging starts
  const startGlobalDrag = () => {
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp as any);
  };

  // Register all bricks and update positions whenever towers change
  React.useEffect(() => {
    // Register all bricks
    collisionService.getAllBricks().forEach(b => collisionService.unregisterBrick(b.uuid));
    towers.forEach(tower => {
      tower.bricks.forEach(brick => collisionService.registerBrick(brick));
    });
    // Update all positions
    const positions = new Map<string, TPoint>();
    towers.forEach(tower => {
      tower.nodesArray().forEach(node => {
        positions.set(node.brick.uuid, node.position);
      });
    });
    collisionService.updateBrickPositions(positions);
    setCollisions(collisionService.getAllCollisions());
  }, [towers, refreshKey]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#f1f2f6', overflow: 'hidden' }}>
      {/* Palette on the left */}
      <aside style={{ width: 280, minWidth: 280, maxWidth: 280, borderRight: '1px solid #ddd', background: '#fff', height: '100vh', position: 'relative', zIndex: 2, boxShadow: '2px 0 8px rgba(0,0,0,0.03)' }}>
        <PaletteWrapper />
      </aside>
      {/* Collision map drop area */}
      <main style={{ flex: 1, position: 'relative', height: '100vh', background: '#fff', borderRadius: 10, margin: '0px 0px 700px 0px', padding: 10, zIndex: 1, boxShadow: '-4px 0 12px -8px #bdbdbd' }}>
        <div
          style={{
            margin: '0px 0px 700px 0px',
            width: '100%',
            height: '100%',
            background: isOver ? '#dff9fb' : '#f8f9fa',
            borderRadius: 10,
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden',
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
            style={{ pointerEvents: 'all', display: 'block' }}
          >
            {/* Render collision lines/highlights */}
            {collisions.map((col, i) => (
              <line
                key={col.id || i}
                x1={col.sourceConnectionPoint.worldX}
                y1={col.sourceConnectionPoint.worldY}
                x2={col.targetConnectionPoint.worldX}
                y2={col.targetConnectionPoint.worldY}
                stroke="#d72660"
                strokeWidth={3}
                opacity={0.7}
                strokeDasharray="6 4"
              />
            ))}
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
      </main>
    </div>
  );
} 