// Guards the cost of a selection change. `TowerBrick` is rendered once per brick on the canvas, so
// anything it subscribes to that changes workspace-wide is paid for by every brick at once. The
// mocked `BrickView` is what makes the renders countable.
//
// The right click suite below covers a real press on a rendered brick reaching the action menu
// store with the right id. The menu itself is not drawn yet, so only the store is asserted
// against.

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TowerStatementNode } from '@/@types/tower.types';

import { makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { useActionMenuStore } from '@/stores/actionMenu';
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
  useActionMenuStore.setState({ brickId: null });
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

/**
 * Renders bricks by id. `TowerBrickView` renders nothing until the layout store reports the brick
 * as mounted, so the flags are seeded here in place of a layout pass.
 */
function renderBricks(...ids: string[]) {
  act(() => {
    useBrickLayoutStore.getState().setMounted(Object.fromEntries(ids.map((id) => [id, true])));
    useBrickLayoutStore.getState().setPositioned(Object.fromEntries(ids.map((id) => [id, true])));
  });

  render(
    <>
      {ids.map((id) => (
        <TowerBrickView key={id} id={id} node={makeEmptyStatement(id, 0)} />
      ))}
    </>,
  );
}

/** The rendered wrapper for a brick, the element carrying the right click handler. */
function brickEl(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`);
  if (!el) throw new Error(`no brick rendered for ${id}`);

  return el;
}

describe('TowerBrickView right click', () => {
  it('opens the action menu on the brick that was pressed', () => {
    renderBricks('brick-1');

    act(() => {
      fireEvent.contextMenu(brickEl('brick-1'));
    });

    expect(useActionMenuStore.getState().brickId).toBe('brick-1');
  });

  it('swallows the browser context menu, so only the action menu shows', () => {
    renderBricks('brick-1');

    // `fireEvent` reports whether the event ran its course, i.e. false once preventDefault ran.
    let ranItsCourse = true;
    act(() => {
      ranItsCourse = fireEvent.contextMenu(brickEl('brick-1'));
    });

    expect(ranItsCourse).toBe(false);
  });

  it('a right click on another brick moves the menu to it', () => {
    renderBricks('brick-1', 'brick-2');

    act(() => {
      fireEvent.contextMenu(brickEl('brick-1'));
    });
    act(() => {
      fireEvent.contextMenu(brickEl('brick-2'));
    });

    expect(useActionMenuStore.getState().brickId).toBe('brick-2');
  });

  it('opens on a value brick as readily as a statement one', () => {
    act(() => {
      useBrickLayoutStore.getState().setMounted({ 'val-1': true });
      useBrickLayoutStore.getState().setPositioned({ 'val-1': true });
    });
    render(<TowerBrickView id="val-1" node={makeEmptyValue('val-1')} />);

    act(() => {
      fireEvent.contextMenu(brickEl('val-1'));
    });

    expect(useActionMenuStore.getState().brickId).toBe('val-1');
  });

  it('leaves the menu closed until a brick is actually pressed', () => {
    renderBricks('brick-1');

    expect(useActionMenuStore.getState().brickId).toBeNull();
  });
});
