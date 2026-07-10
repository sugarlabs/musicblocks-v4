import { Fragment } from 'react';

import type { TowerViewProps } from '@/@types/tower.types';

import { useTowerLayout } from '@/hooks/useTowerLayout';

import { TowerBrickView } from './TowerBrick';

/**
 * Top-level tower component — renders a connected graph of bricks starting from the root node.
 *
 * Walks the tree to list every node, seeds each one's entry in the layout store, and renders a
 * positioned `TowerBrick` per node. Bricks are positioned relative to `origin`, which defaults
 * to (0, 0).
 *
 * Renders as a `position: relative` container by default, or as a fragment when `asChild` is set,
 * letting the parent supply the positioning context instead.
 */
export function TowerView(props: TowerViewProps) {
  const { origin = { x: 0, y: 0 }, asChild = false } = props;

  const nodes = useTowerLayout(props.root, origin);

  const bricks = nodes.map((node) => <TowerBrickView key={node.model.id} node={node} />);

  const Parent = asChild ? Fragment : 'div';

  return <Parent {...(asChild ? {} : { className: 'relative' })}>{bricks}</Parent>;
}
