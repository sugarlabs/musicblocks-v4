// Component tests for TowerBrickView: the `areBricksHidden` visibility rule, and the cost of a
// selection change. `isMounted`/`isPositioned`/`coords` are seeded directly on the brick layout
// store rather than going through a real layout pass, the same way DisconnectShadowView.test.tsx
// seeds its stores. The mocked `BrickView` is what makes the selection re-render tests countable.
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

const NODE = makeEmptyValue('visibility-brick');

afterEach(() => {
  cleanup();
  useWorkspaceStore.setState({
    towers: {},
    selectedBrickId: null,
    lastDragEndBrickId: null,
    lastDragEndTime: 0,
  });
  useActionMenuStore.setState({ brickId: null });
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

describe('TowerBrickView drag-to-click suppression', () => {
  // Trailing clicks within 250ms of a moved drag release are ignored to avoid selecting on drop.
  // Only Date is faked here so the brick preview can render.
  const T0 = new Date('2026-01-01T00:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(T0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('selects the brick on a plain click', () => {
    renderBricks('brick-1');

    fireEvent.click(brickEl('brick-1'));

    expect(useWorkspaceStore.getState().selectedBrickId).toBe('brick-1');
  });

  it('does not select the click that trails a moved drag', () => {
    renderBricks('brick-1');
    act(() =>
      useWorkspaceStore.setState({ lastDragEndBrickId: 'brick-1', lastDragEndTime: T0 }),
    );

    fireEvent.click(brickEl('brick-1'));

    expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
  });

  it('still suppresses a click one tick inside the suppression window', () => {
    renderBricks('brick-1');
    act(() =>
      useWorkspaceStore.setState({ lastDragEndBrickId: 'brick-1', lastDragEndTime: T0 }),
    );

    vi.setSystemTime(T0 + 249);
    fireEvent.click(brickEl('brick-1'));

    expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
  });

  it('selects again once the suppression window has elapsed', () => {
    renderBricks('brick-1');
    act(() =>
      useWorkspaceStore.setState({ lastDragEndBrickId: 'brick-1', lastDragEndTime: T0 }),
    );

    vi.setSystemTime(T0 + 250);
    fireEvent.click(brickEl('brick-1'));

    expect(useWorkspaceStore.getState().selectedBrickId).toBe('brick-1');
  });

  it('does not suppress a click on a different brick within the window', () => {
    renderBricks('brick-1', 'brick-2');
    // Only the brick that moved gets its trailing click swallowed.
    act(() =>
      useWorkspaceStore.setState({ lastDragEndBrickId: 'brick-1', lastDragEndTime: T0 }),
    );

    fireEvent.click(brickEl('brick-2'));

    expect(useWorkspaceStore.getState().selectedBrickId).toBe('brick-2');
  });

  it('suppresses only once, so a later click on the same brick selects', () => {
    renderBricks('brick-1');
    act(() =>
      useWorkspaceStore.setState({ lastDragEndBrickId: 'brick-1', lastDragEndTime: T0 }),
    );

    fireEvent.click(brickEl('brick-1'));
    expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();

    fireEvent.click(brickEl('brick-1'));
    expect(useWorkspaceStore.getState().selectedBrickId).toBe('brick-1');
  });

  it('does not suppress the click after a drag that never moved', () => {
    renderBricks('brick-1');
    // A press that never moved leaves the timestamp at 0, so selection is not suppressed.
    act(() => useWorkspaceStore.getState().markDragEnd('brick-1', false));

    fireEvent.click(brickEl('brick-1'));

    expect(useWorkspaceStore.getState().selectedBrickId).toBe('brick-1');
  });
});
