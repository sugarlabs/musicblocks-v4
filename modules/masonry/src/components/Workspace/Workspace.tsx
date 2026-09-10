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
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { discardTower } from '@/utils/towerDiscard';
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
  const { palette } = config;

  const towersRecord = useWorkspaceStore((state) => state.towers);
  const clearSelection = useWorkspaceStore((state) => state.clearSelection);
  const towers = useMemo(() => Object.values(towersRecord), [towersRecord]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      // Do not delete bricks while the user is typing in an input.
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      const store = useWorkspaceStore.getState();

      // Escape clears the current selection.
      if (event.key === 'Escape') {
        store.clearSelection();
        return;
      }

      // Only Delete and Backspace remove bricks.
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      const selectedBrickId = store.selectedBrickId;

      // Nothing is selected, so there is nothing to delete.
      if (!selectedBrickId) return;

      event.preventDefault();

      const found = findNodeAndTower(selectedBrickId);

      // The selected brick may have already been removed.
      if (!found) {
        store.clearSelection();
        return;
      }

      const { node, tower } = found;

      if (node.model.id === tower.root.model.id) {
        // The selected brick is the root of the tower.
        discardTower(tower.id);
      } else {
        // Detach the selected brick into its own tower, then discard that tower.
        const newTowerId = store.detachBrickToNewTower(
          tower.id,
          selectedBrickId,
          tower.position,
        );

        if (newTowerId) {
          discardTower(newTowerId);
        }
      }

      store.clearSelection();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
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

  return (
    <div ref={rootRef} className="relative flex h-full w-full">
      <div className="h-full max-w-80">
        <Palette config={palette} />
      </div>

      <div
        ref={canvasRef}
        data-testid="workspace-canvas"
        className="bg-background relative h-full w-full shrink overflow-hidden select-none"
        onClick={(event) => {
          if (event.target === event.currentTarget) clearSelection();
        }}
      >
        {/* TowerLayoutEngine runs the layout hooks for each tower to compute brick positions */}
        {towers.map((tower) => (
          <TowerLayoutEngine key={`layout-${tower.id}`} root={tower.root} origin={tower.position} />
        ))}
        {/* TowerBrickView renders the actual DOM nodes for the visible bricks in a flattened list */}
        {visibleNodes.map((node) => (
          <TowerBrickView key={node.model.id} id={node.model.id} node={node} />
        ))}

        <SnapHintOverlay />
        <SnapPreviewView />
        <DisconnectShadowView />
        <ScaleControl />
        {/* The Trash is only useful once there is something to remove */}
        {towers.length > 0 && <Trash canvasRef={canvasRef} />}
      </div>

      <DragGhost ref={ghostRef} />
    </div>
  );
}
