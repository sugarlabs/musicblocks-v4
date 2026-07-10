import type { TowerNode } from '@/@types/tower.types';

import { BrickView } from '@/components/Brick/Brick';
import { useBrickLayoutStore } from '@/stores';

export interface TowerBrickViewProps {
  /** The tower node whose brick should be rendered. */
  node: TowerNode;
}

/**
 * Positions a single brick within a tower.
 *
 * `BrickView` itself is static and has no notion of layout, so this wraps it, subscribes to the
 * node's entry in the layout store, and translates itself to that position whenever it changes.
 * Renders nothing until the store reports the node's position as ready.
 */
export function TowerBrickView(props: TowerBrickViewProps) {
  const { node } = props;

  const { x, y } = useBrickLayoutStore((state) => state.bounds[node.model.id]);
  const isReady = useBrickLayoutStore((state) => state.ready[node.model.id]);

  if (!isReady) return null;

  const brick = (() => {
    switch (node.kind) {
      case 'value':
        return <BrickView kind={node.kind} model={node.model} />;
      case 'expression':
        return <BrickView kind={node.kind} model={node.model} />;
      case 'statement':
        return <BrickView kind={node.kind} model={node.model} />;
    }
  })();

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {brick}
    </div>
  );
}
