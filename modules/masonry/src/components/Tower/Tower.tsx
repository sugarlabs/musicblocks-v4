import { Fragment } from 'react';

import type { TowerViewProps } from '@/@types/tower.types';

import { useTowerLayout } from '@/hooks/useTowerLayout';

import { BrickWrapperView } from './BrickWrapper';

/**
 * Top-level tower component — renders a connected graph of bricks starting from the root node.
 *
 * Walks the tree to list every node, seeds each one's entry in the layout store, and renders a
 * positioned `BrickWrapper` per node.
 *
 * Renders as a `position: relative` container by default, or as a fragment when `asChild` is set,
 * letting the parent supply the positioning context instead.
 */
export function TowerView(props: TowerViewProps) {
  const { asChild = false } = props;

  const nodes = useTowerLayout(props.root);

  const bricks = nodes.map((node) => <BrickWrapperView key={node.model.id} node={node} />);

  const Parent = asChild ? Fragment : 'div';

  return <Parent {...(asChild ? {} : { className: 'relative' })}>{bricks}</Parent>;
}
