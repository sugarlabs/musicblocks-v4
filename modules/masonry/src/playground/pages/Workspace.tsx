import { useEffect, useMemo, useRef } from 'react';

import type { TowerStatementNode } from '@/@types/tower.types';

import { Workspace } from '@/components/Workspace/Workspace';
import { mockPaletteConfig } from '@/mocks/palette';
import { createMockTowerRoot } from '@/mocks/workspaceTower';
import { useWorkspaceStore } from '@/stores/workspace';
import { listNodes } from '@/utils/tower-traversal';

/**
 * Dev-only stand-in for the fold control, so the collapse can be watched on the canvas before the
 * chevron on the brick itself lands. Lists every brick with something in its cavity and toggles it
 * through the store, the same call the chevron will make.
 */
function FoldControls() {
  const towersRecord = useWorkspaceStore((state) => state.towers);

  const foldable = useMemo(
    () =>
      Object.values(towersRecord)
        .flatMap((tower) => listNodes(tower.root))
        .filter(
          (node): node is TowerStatementNode =>
            node.kind === 'statement' && node.model.hasNesting && node.nestedNext != null,
        ),
    [towersRecord],
  );

  if (foldable.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-50 w-64 rounded-lg bg-white/95 p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-700">Fold a cavity</p>
      <div className="flex flex-col gap-1">
        {foldable.map((node) => (
          <button
            key={node.model.id}
            onClick={() =>
              useWorkspaceStore
                .getState()
                .setNestingFold(node.model.id, !node.model.isNestingFolded)
            }
            className="flex items-center justify-between rounded bg-slate-100 px-2 py-1 text-left hover:bg-slate-200"
          >
            <span className="truncate">
              {node.model.widget.type === 'label' ? node.model.widget.text : node.model.id}
            </span>
            <span className="ml-2 shrink-0 font-mono text-slate-500">
              {node.model.isNestingFolded ? 'folded' : 'open'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WorkspaceDemo() {
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize the workspace with a pre-configured mock tower containing nested bricks for testing
    if (!initialized.current) {
      initialized.current = true;
      const root = createMockTowerRoot();
      useWorkspaceStore.getState().createTower({
        id: 'mock-tower-1',
        position: { x: 400, y: 100 },
        root,
      });
    }
  }, []);

  return (
    <div className="h-full w-full bg-indigo-100 p-2">
      <div className="relative h-full w-full rounded-lg bg-white">
        <Workspace config={{ palette: mockPaletteConfig }} />
        <FoldControls />
      </div>
    </div>
  );
}
