import { useEffect, useMemo, useRef } from 'react';

import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { WorkspaceViewProps } from '@/@types/workspace.types';
import type { TowerNode } from '@/@types/tower.types';
import type { Point } from '@/@types/common.types';

import { Palette } from '@/components/Palette/Palette';
import { TowerBrickView } from '@/components/Tower/TowerBrick';
import { useDragFromPalette } from '@/hooks/useDragFromPalette';
import { useTowerLayout } from '@/hooks/useTowerLayout';
import { useWorkspaceScale } from '@/hooks/useWorkspaceScale';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { listVisibleNodes } from '@/utils/tower-traversal';

import { DragGhost } from './DragGhost';
import { ScaleControl } from './ScaleControl';
import { SnapHintOverlay } from './SnapHintOverlay';
import { SnapPreviewView } from './SnapPreviewView';
import { DisconnectShadowView } from './DisconnectShadowView';
import { Trash } from './Trash';

function TowerLayoutEngine({ root, origin }: { root: TowerNode; origin: Point }) {
  useTowerLayout(root, origin);
  return null;
}

export function Workspace({ config }: WorkspaceViewProps) {
  const { offsetX, offsetY } = useWorkspaceViewportStore();
  const { palette } = config;

  const towersRecord = useWorkspaceStore((state) => state.towers);
  const towers = useMemo(() => Object.values(towersRecord), [towersRecord]);

  // Only what a fold leaves on screen: a brick inside a folded cavity is never rendered. The
  // memo re-runs off the towers record, which is why `setNestingFold` re-seats the tower it folds:
  // the canvas and the re-layout both follow off that one signal.
  const visibleNodes = useMemo(() => {
    return towers.flatMap((tower) => listVisibleNodes(tower.root));
  }, [towers]);

  // palette drag-and-drop wiring: the root element scopes the delegated drag
  // selector and positions the ghost overlay; the canvas element anchors drop coordinates.
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // Flat id → config lookup across the whole palette hierarchy, used to resolve a dragged slot's
  // `data-brick-id` back to its full palette entry.
  const bricksById = useMemo(() => {
    const map: Record<string, PaletteBrickConfig> = {};
    for (const classification of palette.classifications) {
      for (const category of classification.categories) {
        for (const brick of category.bricks) {
          map[brick.id] = brick;
        }
      }
    }
    return map;
  }, [palette]);

  useDragFromPalette({ rootRef, canvasRef, ghostRef, bricksById });

  // Resize every brick and re-run the layouts whenever the scale level changes
  useWorkspaceScale();

  // Sync collision space whenever the layout finishes positioning bricks
  useEffect(() => {
    return useBrickLayoutStore.subscribe(
      (state) => state.positioned,
      () => {
        // Defer to the next tick to avoid updating useWorkspaceStore (and thus Workspace)
        // while TowerView is in the middle of rendering its layout.
        queueMicrotask(() => {
          const store = useWorkspaceStore.getState();
          const activeTowers = Object.values(store.towers);
          for (const tower of activeTowers) {
            store.syncStatementConnectors(tower.id, tower.root);
            store.syncArgumentConnectors(tower.id, tower.root);
          }
        });
      },
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      let dx = e.deltaX;
      let dy = e.deltaY;

      // Normalize Shift+Wheel for browsers that do not natively map it to deltaX
      if (e.shiftKey && dx === 0) {
        dx = dy;
        dy = 0;
      }

      const current = useWorkspaceViewportStore.getState();
      const workspaceState = useWorkspaceStore.getState();

      // Calculate dynamic bounds based on existing towers/blocks
      const towers = Object.values(workspaceState.towers || {});
      let minContentX = -1000;
      let maxContentX = 3000;
      let minContentY = -1000;
      let maxContentY = 3000;

      if (towers.length > 0) {
        const padding = 500;
        const xs = towers.map(t => t.position?.x ?? 0);
        const ys = towers.map(t => t.position?.y ?? 0);
        
        minContentX = Math.min(...xs) - padding;
        maxContentX = Math.max(...xs) + padding;
        minContentY = Math.min(...ys) - padding;
        maxContentY = Math.max(...ys) + padding;
      }

      const nextX = Math.min(Math.max(current.offsetX - dx, -maxContentX), -minContentX);
      const nextY = Math.min(Math.max(current.offsetY - dy, -maxContentY), -minContentY);

      // Only preventDefault and update if the canvas actually moves
      if (nextX !== current.offsetX || nextY !== current.offsetY) {
        e.preventDefault();
        useWorkspaceViewportStore.getState().setOffset(nextX, nextY);
      }
    };

    // passive: false is required to safely call preventDefault on wheel events
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative flex h-full w-full">
      <div className="h-full max-w-80">
        <Palette config={palette} />
      </div>

      <div
        ref={canvasRef}
        className="bg-background relative h-full w-full shrink overflow-hidden select-none"
      >
        {/* TowerLayoutEngine runs the layout hooks for each tower to compute brick positions */}
        {towers.map((tower) => (
          <TowerLayoutEngine key={`layout-${tower.id}`} root={tower.root} origin={tower.position} />
        ))}
        
        {/* Dedicated layer for panning transforms */}
        <div 
          className="brick-layer absolute top-0 left-0 h-full w-full"
          style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
        >
          {/* TowerBrickView renders the actual DOM nodes for the visible bricks in a flattened list */}
          {visibleNodes.map((node) => (
            <TowerBrickView key={node.model.id} id={node.model.id} node={node} />
          ))}

          <SnapHintOverlay />
          <SnapPreviewView />
          <DisconnectShadowView />
        </div>

        <ScaleControl />
        {/* The Trash is only useful once there is something to remove */}
        {towers.length > 0 && <Trash canvasRef={canvasRef} />}
      </div>

      <DragGhost ref={ghostRef} />
    </div>
  );
}
