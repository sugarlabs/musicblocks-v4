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

export default function WorkspaceCanvas() {
  const { origin } = useRecoilValue(dragStateAtom);
  const [towers, setTowers] = useRecoilState(towersAtom);
  const [isOver, setIsOver] = useState(false);
  const [draggedBrickId, setDraggedBrickId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [isDragging, handleMouseMove]);

  // Attach global listeners when dragging starts
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
