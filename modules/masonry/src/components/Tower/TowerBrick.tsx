import { memo, useCallback, useRef, type MouseEvent } from 'react';

import type { TowerNode } from '@/@types/tower.types';

import { BrickView } from '@/components/Brick/Brick';
import { useBrickMove } from '@/hooks/useBrickMove';
import { useActionMenuStore } from '@/stores/actionMenu';
import { useBrickLayoutStore } from '@/stores/brick';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { darkenColor } from '@/utils/color';

/** How far a selected brick rises off the canvas, in px. */
const LIFT_PX = 3;

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

  // Subscribed as the derived boolean rather than the id itself: every brick on the canvas holds
  // one of these, and an id would hand all of them a changed value on every selection change. The
  // boolean only flips for the two bricks that actually gained or lost the selection.
  const isSelected = useWorkspaceStore((state) => state.selectedBrickId === id);

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
  // Read at press time like `toggleFold` above, so the handler stays keyed on `id` alone.
  const handleClick = useCallback(() => {
    useWorkspaceStore.getState().selectBrick(id);
  }, [id]);

  // A selected brick is ringed in a deepened shade of its own fill, dark enough to hold against the
  // light canvas the bricks sit on. `drop-shadow` follows the rendered alpha, so the ring traces the
  // outline (notches and cavity included) instead of boxing the bounding rect the way an `outline`
  // would. Chained rather than one wide blur: each pass re-blurs the last, building a solid rim at
  // the edge that falls off into a glow. The cast shadow comes last, so it is thrown by the ringed
  // silhouette and lands under the brick the lift raises.
  const highlight = darkenColor(node.model.colorsDefault.background, 0.45);
  const highlightFilter =
    `drop-shadow(0 0 1px ${highlight}) drop-shadow(0 0 2px ${highlight}) ` +
    `drop-shadow(0 0 4px ${highlight}) drop-shadow(0 ${LIFT_PX + 1}px 3px rgb(0 0 0 / 0.3))`;

  // Opened from the brick rather than a document listener, so the menu keys off the brick the
  // press actually landed on. `preventDefault` swallows the browser's own menu, and interact.js
  // drags on the primary button alone, so this press cannot also tear the brick out of its tower.
  const openActionMenu = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      useActionMenuStore.getState().open(id);
    },
    [id],
  );

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
      onClick={handleClick}
      onContextMenu={openActionMenu}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        visibility: isPositioned ? 'visible' : 'hidden',
      }}
    >
      {/*
        The lift rides an inner wrapper rather than the transform above it: that one is the brick's
        seat in the tower, and `useBrickMove` and the collision math both measure this element's
        rect off it. Raising the brick inside leaves all of that reading exactly what it did before,
        and leaves this transform free to animate without fighting a drag.
      */}
      <div
        style={{
          transform: isSelected ? `translateY(-${LIFT_PX}px)` : undefined,
          filter: isSelected ? highlightFilter : undefined,
          transition: 'transform 120ms ease-out',
        }}
      >
        {brick}
      </div>
    </div>
  );
});
