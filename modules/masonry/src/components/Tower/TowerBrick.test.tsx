// Component tests for TowerBrickView: the `areBricksHidden` visibility rule, and the cost of a
// selection change. `isMounted`/`isPositioned`/`coords` are seeded directly on the brick layout
// store rather than going through a real layout pass, the same way DisconnectShadowView.test.tsx
// seeds its stores. The mocked `BrickView` is what makes the selection re-render tests countable.

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TowerStatementNode } from '@/@types/tower.types';

import { makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
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

const NODE = makeEmptyValue('visibility-brick');

afterEach(() => {
  cleanup();
  useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  act(() => {
    useWorkspaceStore.setState({ areBricksHidden: false });
  });
});

/** Marks the brick mounted and positioned, the state `TowerBrickView` needs to render visibly. */
function seedLayout() {
  useBrickLayoutStore.setState({
    coords: { [NODE.model.id]: { x: 0, y: 0 } },
    mounted: { [NODE.model.id]: true },
    positioned: { [NODE.model.id]: true },
  });
}

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
  it('is visible when positioned and bricks are not hidden', () => {
    seedLayout();

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;

    expect(wrapper.style.visibility).toBe('visible');
  });

  it('is hidden once areBricksHidden is set, even though it is positioned', () => {
    seedLayout();
    act(() => {
      useWorkspaceStore.getState().setBricksHidden(true);
    });

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;

    expect(wrapper.style.visibility).toBe('hidden');
  });

  it('goes back to visible when areBricksHidden is lifted again', () => {
    seedLayout();
    act(() => {
      useWorkspaceStore.getState().setBricksHidden(true);
    });

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;
    expect(wrapper.style.visibility).toBe('hidden');

    act(() => {
      useWorkspaceStore.getState().setBricksHidden(false);
    });

    expect(wrapper.style.visibility).toBe('visible');
  });

  it('stays hidden while unpositioned regardless of areBricksHidden', () => {
    // Mounted but not yet positioned — the pre-existing rule this flag is layered on top of.
    useBrickLayoutStore.setState({
      coords: { [NODE.model.id]: { x: 0, y: 0 } },
      mounted: { [NODE.model.id]: true },
      positioned: { [NODE.model.id]: false },
    });

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;

    expect(wrapper.style.visibility).toBe('hidden');
  });

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
