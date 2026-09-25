// Tests for `useBrickMove`'s interact.js wiring: the `enabled` option that tracks
// `!areBricksHidden`, and the drag-end stamping that suppresses the trailing click.
// The file is .tsx so it runs in the dom project — importing the hook pulls in
// interact.js, which expects a window at module scope.

import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';

import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceStore } from '@/stores/workspace';

import { useBrickMove } from './useBrickMove';

const { interactableMock, interactMock } = vi.hoisted(() => {
  const interactableMock = {
    draggable: vi.fn(),
    unset: vi.fn(),
  };
  // interact.js's `draggable(...)` call returns the same chainable Interactable instance.
  interactableMock.draggable.mockReturnValue(interactableMock);
  const interactMock = vi.fn(() => interactableMock);
  return { interactableMock, interactMock };
});

vi.mock('interactjs', () => ({ default: interactMock }));

/** Options object from the most recent `interact(el).draggable(...)` call. */
function lastDraggableOptions() {
  const calls = interactableMock.draggable.mock.calls;
  return calls[calls.length - 1][0] as { enabled: boolean };
}

/** Listeners object from the most recent `interact(el).draggable(...)` call. */
function dragListeners() {
  const calls = interactableMock.draggable.mock.calls;
  return (calls[calls.length - 1][0] as { listeners: Record<string, (event: unknown) => void> })
    .listeners;
}

/** Mounts `useBrickMove` on a plain div, the same way `TowerBrickView` does. */
function MoveHarness({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useBrickMove(id, ref);
  return <div ref={ref} />;
}

/** Mounts the hook over a brick element, the way `TowerBrick` does. */
function mountBrickMove(id: string) {
  const el = document.createElement('div');
  document.body.append(el);

  renderHook(() => useBrickMove(id, { current: el }));
}

/** A one-brick tower for `findNodeAndTower` to resolve the dragged brick against. */
function seedTower(id: string) {
  act(() => {
    useWorkspaceStore.getState().createTower({
      id: 'tower-1',
      root: makeEmptyStatement(id, 0),
      position: { x: 0, y: 0 },
    });
  });
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.clearAllMocks();
  act(() => {
    useWorkspaceStore.setState({ areBricksHidden: false, towers: {}, lastDragEndTime: 0 });
  });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  useTrashStore.setState({ bounds: null, isHovered: false });
});

describe('useBrickMove visibility', () => {
  it('leaves dragging enabled while bricks are visible', () => {
    render(<MoveHarness id="brick-1" />);

    expect(lastDraggableOptions().enabled).toBe(true);
  });

  it('disables dragging up front when bricks start out hidden', () => {
    act(() => {
      useWorkspaceStore.getState().setBricksHidden(true);
    });

    render(<MoveHarness id="brick-2" />);

    expect(lastDraggableOptions().enabled).toBe(false);
  });

  it('disables dragging when bricks are hidden mid-session, and re-enables it once shown again', () => {
    render(<MoveHarness id="brick-3" />);
    expect(lastDraggableOptions().enabled).toBe(true);

    act(() => {
      useWorkspaceStore.getState().setBricksHidden(true);
    });
    expect(lastDraggableOptions().enabled).toBe(false);

    act(() => {
      useWorkspaceStore.getState().setBricksHidden(false);
    });
    expect(lastDraggableOptions().enabled).toBe(true);
  });
});

describe('useBrickMove drag-to-click suppression', () => {
  it('stamps lastDragEndTime when a drag actually moved', () => {
    seedTower('b0');
    mountBrickMove('b0');

    const { start, move, end } = dragListeners();
    act(() => {
      start({});
      move({ dx: 8, dy: 4, clientX: 100, clientY: 100 });
      end({ clientX: 100, clientY: 100 });
    });

    expect(useWorkspaceStore.getState().lastDragEndTime).toBeGreaterThan(0);
  });

  it('leaves lastDragEndTime at 0 for a press that never moved', () => {
    seedTower('b0');
    mountBrickMove('b0');

    const { start, end } = dragListeners();
    act(() => {
      start({});
      end({ clientX: 0, clientY: 0 });
    });

    expect(useWorkspaceStore.getState().lastDragEndTime).toBe(0);
  });

  it('does not leak movement state into a subsequent unmoved gesture on the same brick', () => {
    seedTower('b0');
    mountBrickMove('b0');

    const { start, move, end } = dragListeners();
    act(() => {
      start({});
      move({ dx: 8, dy: 4, clientX: 100, clientY: 100 });
      end({ clientX: 100, clientY: 100 });
    });
    expect(useWorkspaceStore.getState().lastDragEndTime).toBeGreaterThan(0);

    act(() => {
      start({});
      end({ clientX: 100, clientY: 100 });
    });
    expect(useWorkspaceStore.getState().lastDragEndTime).toBe(0);
  });

  it('records the end before the early return when nothing about the drag was tracked', () => {
    // Stamped ahead of the !state guard so dropping an untracked brick still suppresses the click.
    mountBrickMove('absent');

    const { start, move, end } = dragListeners();
    act(() => {
      start({});
      move({ dx: 5, dy: 5, clientX: 50, clientY: 50 });
      end({ clientX: 50, clientY: 50 });
    });

    expect(useWorkspaceStore.getState().lastDragEndTime).toBeGreaterThan(0);
  });
});
