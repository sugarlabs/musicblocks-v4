import { useEffect, useMemo, useRef } from 'react';

import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { WorkspaceViewProps } from '@/@types/workspace.types';
import type { TowerNode } from '@/@types/tower.types';
import type { Point } from '@/@types/common.types';

import { Palette } from '@/components/Palette/Palette';
import { TowerBrickView } from '@/components/Tower/TowerBrick';
import { useActionMenuDismiss } from '@/hooks/useActionMenuDismiss';
import { useActionMenuTarget } from '@/hooks/useActionMenuTarget';
import { useCanvasKeyboardNav } from '@/hooks/useCanvasKeyboardNav';
import { useCanvasPan } from '@/hooks/useCanvasPan';
import { useDragFromPalette } from '@/hooks/useDragFromPalette';
import { useTowerLayout } from '@/hooks/useTowerLayout';
import { useWorkspaceScale } from '@/hooks/useWorkspaceScale';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel } from '@/utils/brick-model-factory';
import { discardTower } from '@/utils/towerDiscard';
import { listVisibleNodes } from '@/utils/tower-traversal';
import { findKeyboardPlacement, placeBrickFromPalette } from '@/utils/palette-placement';

import { ActionMenu } from './ActionMenu';
import { DragGhost } from './DragGhost';
import { FullscreenControl } from './FullscreenControl';
import { BricksVisibilityControl } from './BricksVisibilityControl';
import { ScaleControl } from './ScaleControl';
import { SnapHintOverlay } from './SnapHintOverlay';
import { SnapPreviewView } from './SnapPreviewView';
import { DisconnectShadowView } from './DisconnectShadowView';
import { Trash } from './Trash';
import { Navbar } from './Navbar';

function TowerLayoutEngine({ root, origin }: { root: TowerNode; origin: Point }) {
  useTowerLayout(root, origin);
  return null;
}

export function Workspace({ config }: WorkspaceViewProps) {
  const { palette } = config;

  const towersRecord = useWorkspaceStore((state) => state.towers);
  const clearSelection = useWorkspaceStore((state) => state.clearSelection);
  const areBricksHidden = useWorkspaceStore((state) => state.areBricksHidden);
  const towers = useMemo(() => Object.values(towersRecord), [towersRecord]);

  // Initialize history on mount
  useEffect(() => {
    import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
      useWorkspaceHistoryStore.getState().init();
    });
  }, []);

  /**
   * Places a brick selected from the palette into the workspace canvas.
   * Calculates collision-free keyboard placement coordinates within the visible viewport and adds the tower.
   *
   * @param brick - The palette brick configuration to instantiate.
   */
  const placePaletteBrick = (brick: PaletteBrickConfig) => {
    const scaleLevel = useWorkspaceScaleStore.getState().level;
    const model = createBrickModel({ ...brick.brick, scaleLevel });
    model.computeDims();

    let dims = model.dims;
    if (typeof document !== 'undefined') {
      const slotSvg = document.querySelector(
        `.palette-brick-slot[data-brick-id="${brick.id}"] svg`,
      );
      if (slotSvg) {
        const rect = slotSvg.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          dims = { w: rect.width, h: rect.height };
        }
      }
    }

    const viewportOffset = useWorkspaceViewportStore.getState().offset;
    const position = findKeyboardPlacement(towersRecord, dims, { viewportOffset });
    placeBrickFromPalette(brick, { anchor: position });
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      // Backspace is how a value gets corrected in a brick's own widget, so a press that landed in
      // an editable belongs to that editable and never to the brick behind it.
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      const store = useWorkspaceStore.getState();

      if (event.key === 'Escape') {
        store.clearSelection();
        return;
      }

      // Undo / Redo keyboard shortcuts
      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault(); // prevent browser default undo
        import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
          if (event.shiftKey) {
            useWorkspaceHistoryStore.getState().redo();
          } else {
            useWorkspaceHistoryStore.getState().undo();
          }
        });
        return;
      }

      if (ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
          useWorkspaceHistoryStore.getState().redo();
        });
        return;
      }

      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      const selectedBrickId = store.selectedBrickId;
      if (!selectedBrickId) return;

      // Held back until there is something to delete, so an unselected canvas leaves Backspace to
      // the browser's own back navigation rather than swallowing it.
      event.preventDefault();

      // A selection outlives the brick it points at: the trash and a drop that joins two towers
      // both take bricks off the canvas without going through here.
      const found = findNodeAndTower(selectedBrickId);
      if (!found) {
        store.clearSelection();
        return;
      }

      const { node, tower } = found;

      if (node.model.id === tower.root.model.id) {
        // The root is the tower, so there is nothing to sever it from.
        discardTower(tower.id);
      } else {
        // Severed into a tower of its own first, the same path a drag takes a brick out on, and
        // that tower is what gets discarded. Note this carries off everything below the brick too,
        // since the detach takes its whole `next` chain with it.
        const newTowerId = store.detachBrickToNewTower(tower.id, selectedBrickId, tower.position);

        if (newTowerId) {
          discardTower(newTowerId);
        }
      }

      store.clearSelection();

      import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
        useWorkspaceHistoryStore.getState().commit();
      });
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

  const { handleKeyDown } = useCanvasKeyboardNav();

  // palette drag-and-drop wiring: the root element scopes the delegated drag
  // selector and positions the ghost overlay; the canvas element anchors drop coordinates.
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // The node the towers and their overlays are drawn in. A pan moves this one element, so brick
  // coordinates stay canvas-local and nothing has to be laid out again.
  const viewportRef = useRef<HTMLDivElement>(null);

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

  // Dragging the empty background pans; the viewport node follows the store's offset
  useCanvasPan({ canvasRef, viewportRef });

  // Resize every brick and re-run the layouts whenever the scale level changes
  useWorkspaceScale();

  // Escape and a press outside close the action menu; its listeners are on the document
  useActionMenuDismiss();
  // ...and so does the brick it is open on leaving the screen
  useActionMenuTarget(visibleNodes);

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
    <div className="flex h-full w-full flex-col">
      <Navbar />

      {/* Main Workspace Area: Contains the draggable block palette on the left and the interactive canvas on the right */}
      <div ref={rootRef} className="relative flex min-h-0 w-full flex-1">
        {!areBricksHidden && (
          <div className="h-full max-w-80 shrink-0">
            <Palette config={palette} onBrickActivate={placePaletteBrick} />
          </div>
        )}

        <div
          ref={canvasRef}
          data-workspace-canvas
          data-testid="workspace-canvas"
          role="region"
          aria-label="Workspace Canvas"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="bg-background focus:ring-ring focus-visible:ring-ring relative h-full w-full shrink overflow-hidden outline-none select-none focus:ring-2 focus:ring-inset focus-visible:ring-2 focus-visible:ring-inset"
          // Only a press on the canvas itself clears: the bricks are its children, so without the
          // target check every click that selected one would arrive here and drop it again.
          onClick={(event) => {
            if (event.target === event.currentTarget) clearSelection();
          }}
        >
          {/* TowerLayoutEngine runs the layout hooks for each tower to compute brick positions */}
          {towers.map((tower) => (
            <TowerLayoutEngine
              key={`layout-${tower.id}`}
              root={tower.root}
              origin={tower.position}
            />
          ))}
          {/* Everything drawn in canvas coordinates lives in the viewport node, which is what a pan
            moves; the controls after it stay pinned to the canvas. */}
          <div
            ref={viewportRef}
            data-testid="workspace-viewport"
            className="absolute inset-0 will-change-transform"
          >
            {/* TowerBrickView renders the actual DOM nodes for the visible bricks in a flattened list */}
            {visibleNodes.map((node) => (
              <TowerBrickView key={node.model.id} id={node.model.id} node={node} />
            ))}

            <SnapHintOverlay />
            <SnapPreviewView />
            <DisconnectShadowView />
            {/* Last in the overlay, so the menu draws over the bricks it is opened on */}
            <ActionMenu />
          </div>

          {/* One right-anchored row: the zoom controls change width as the reset button comes and
              goes, so the fullscreen button is laid out against them rather than pinned to an offset
              that only holds at the default level. */}
          <div
            data-testid="workspace-controls"
            className="absolute right-26 bottom-6 z-40 flex h-14 items-center gap-6"
          >
            <FullscreenControl />
            <ScaleControl />
          </div>
          {/* The Trash is only useful once there is something to remove */}
          {towers.length > 0 && <Trash canvasRef={canvasRef} />}
        </div>

        <BricksVisibilityControl />

        <DragGhost ref={ghostRef} />
      </div>
    </div>
  );
}
