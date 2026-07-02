import type { TowerViewProps } from '@/@types/tower.types';

import { useTowerLayout } from '@/hooks/useTowerLayout';

/**
 * Top-level tower component — renders a connected graph of bricks starting from the root node.
 */
export function TowerView(props: TowerViewProps) {
  useTowerLayout(props.root);

  return null;
}
