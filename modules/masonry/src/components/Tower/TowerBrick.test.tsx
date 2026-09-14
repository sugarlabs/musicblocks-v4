// Guards the cost of a selection change. `TowerBrick` is rendered once per brick on the canvas, so
// anything it subscribes to that changes workspace-wide is paid for by every brick at once. The
// mocked `BrickView` is what makes the renders countable.

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TowerStatementNode } from '@/@types/tower.types';

import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';

const renders = { count: 0 };

vi.mock('@/components/Brick/Brick', () => ({
  BrickView: (props: { model: { id: string } }) => {
    renders.count += 1;
    return <span data-brick={props.model.id} />;
  },
}));

const { TowerBrickView } = await import('./TowerBrick');

afterEach(() => {
  cleanup();
  useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
});

/** A single tower of `count` statement bricks joined head to tail, all mounted. */
function makeChain(count: number): TowerStatementNode[] {
  const nodes = Array.from({ length: count }, (_, i) => makeEmptyStatement(`b${i}`, 0, false));

  nodes.forEach((node, i) => {
    if (i === 0) return;
    nodes[i - 1].next = node;
    node.prev = nodes[i - 1];
  });

  useBrickLayoutStore
    .getState()
    .setMounted(Object.fromEntries(nodes.map((node) => [node.model.id, true])));

  return nodes;
}

describe('TowerBrickView', () => {
  it('re-renders only the bricks whose selected state actually changed', () => {
    const nodes = makeChain(20);

    const { container } = render(
      <>
        {nodes.map((node) => (
          <TowerBrickView key={node.model.id} id={node.model.id} node={node} />
        ))}
      </>,
    );

    act(() => {
      useWorkspaceStore.getState().createTower({
        id: 'chain',
        root: nodes[0],
        position: { x: 0, y: 0 },
      });
    });

    renders.count = 0;
    fireEvent.click(container.querySelector('[data-id="b0"]') as HTMLElement);
    expect(useWorkspaceStore.getState().selectedBrickId).toBe('b0');
    // Just the brick that gained the selection; nothing was holding it to lose.
    expect(renders.count).toBeLessThanOrEqual(1);

    renders.count = 0;
    fireEvent.click(container.querySelector('[data-id="b7"]') as HTMLElement);
    expect(useWorkspaceStore.getState().selectedBrickId).toBe('b7');
    // The brick that gained it and the one that lost it, and none of the other eighteen.
    expect(renders.count).toBeLessThanOrEqual(2);
  });
});
