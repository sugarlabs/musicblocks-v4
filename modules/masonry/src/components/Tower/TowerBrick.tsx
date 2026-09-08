import { memo, useCallback, useRef } from 'react';

import type { TowerNode } from '@/@types/tower.types';

import { BrickView } from '@/components/Brick/Brick';
import { useBrickMove } from '@/hooks/useBrickMove';
import { useBrickLayoutStore } from '@/stores/brick';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';

export interface TowerBrickViewProps {
  /** Unique identifier, kept separate from `node` since `node`'s identity changes every render. */
  id: string;
  /** The tower node whose brick should be rendered. */
  node: TowerNode;
}

/**
 * Positions a single brick within a tower.
 *
 * `BrickView` itself is static and has no notion of layout, so this wraps it, subscribes to the
 * node's entry in the layout store, and translates itself to that position whenever it changes.
 * Renders nothing until the store reports the node as mounted (so it can render and be measured),
 * and stays visually hidden until it's also positioned, to avoid a flash at a stale position.
 */
export const TowerBrickView = memo(function (props: TowerBrickViewProps) {
  const { id, node } = props;
  const ref = useRef<HTMLDivElement>(null);

  useBrickMove(id, ref);

  // We explicitly extract coords without returning a fallback object in the selector.
  // Returning a new `{ x: 0, y: 0 }` object inside the selector would cause useSyncExternalStore
  // to detect a new reference on every render, triggering an infinite re-render loop.
  const coords = useBrickLayoutStore((state) => state.coords[id]);
  const x = coords?.x ?? 0;
  const y = coords?.y ?? 0;
  const isMounted = useBrickLayoutStore((state) => state.mounted[id]);
  const isPositioned = useBrickLayoutStore((state) => state.positioned[id]);

  // The fold goes through the store rather than straight onto the model: it decides what the tower
  // lays out and what the canvas draws, and `setNestingFold` is what re-seats the tower for both.
  // The node is looked up at press time, the same way `useBrickMove` does it, so the handler stays
  // keyed on `id` alone — `node`'s identity changes on every render.
  const toggleFold = useCallback(() => {
    const found = findNodeAndTower(id);
    if (!found || found.node.kind !== 'statement') return;

    useWorkspaceStore.getState().setNestingFold(id, !found.node.model.isNestingFolded);
  }, [id]);

  if (!isMounted) return null;

  const brick = (() => {
    switch (node.kind) {
      case 'value':
        return <BrickView kind={node.kind} model={node.model} />;
      case 'expression':
        return <BrickView kind={node.kind} model={node.model} />;
      case 'statement':
        return (
          <BrickView
            kind={node.kind}
            model={node.model}
            fold={{ isCavityEmpty: node.nestedNext == null, onToggle: toggleFold }}
          />
        );
    }
  })();

  return (
    <div
      ref={ref}
      data-id={id}
      data-tower-brick=""
      className="absolute"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        visibility: isPositioned ? 'visible' : 'hidden',
      }}
    >
      {brick}
    </div>
  );
});
