// Tests for `useBrickMove`'s interact.js wiring: the `enabled` option that tracks
// `!areBricksHidden`, and the drag-end stamping that suppresses the trailing click.
// The file is .tsx so it runs in the dom project — importing the hook pulls in
// interact.js, which expects a window at module scope.

import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';

import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceStore } from '@/stores/workspace';
import { DRAG_CLICK_SUPPRESSION_MS } from '@/utils/constants';

import { triggerBrickAnimation, useBrickMove } from './useBrickMove';

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

  return renderHook(() => useBrickMove(id, { current: el }));
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
    useWorkspaceStore.setState({
      areBricksHidden: false,
      towers: {},
    });
  });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  useTrashStore.setState({ bounds: null, isHovered: false });
});

describe('useBrickMode triggerBrickAnimation', () => {
  beforeEach(() => {
      vi.useFakeTimers();
      document.body.innerHTML = '<div data-id="test-element"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('adds the animationClass to the brick and then removes it after 400ms', () => {

    const element = document.querySelector<HTMLElement>(`[data-id="test-element"]`);

    expect(element).not.toBeNull();

    act(()=>{
      triggerBrickAnimation("test-element", "test-animation");
    })

    expect(element?.classList.contains("test-animation")).toBe(true);

    act(()=>{
      vi.advanceTimersByTime(400);
    });

    expect(element?.classList.contains("test-animation")).toBe(false);
  });
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
  // interact.js only starts a drag once the pointer has moved, so `start`/`end` here stand in for a
  // real drag. Only Date is faked so the suppression window can be stepped through deterministically.
  const T0 = new Date('2026-01-01T00:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(T0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Drives a moved drag through the listeners the hook registered. */
  function dragBrick() {
    const { start, move, end } = dragListeners();
    act(() => {
      start({});
      move({ dx: 8, dy: 4, clientX: 100, clientY: 100 });
      end({ clientX: 100, clientY: 100 });
    });
  }

  it('reports suppression right after a moved drag ends', () => {
    seedTower('b0');
    const { result } = mountBrickMove('b0');

    dragBrick();

    expect(result.current()).toBe(true);
  });

  it('still reports suppression one tick inside the window', () => {
    seedTower('b0');
    const { result } = mountBrickMove('b0');

    dragBrick();
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS - 1);

    expect(result.current()).toBe(true);
  });

  it('stops reporting suppression once the window has elapsed', () => {
    seedTower('b0');
    const { result } = mountBrickMove('b0');

    dragBrick();
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS);

    expect(result.current()).toBe(false);
  });

  it('reports no suppression before the brick has ever been dragged', () => {
    seedTower('b0');
    const { result } = mountBrickMove('b0');

    expect(result.current()).toBe(false);
  });

  it('records the drag end even when the drop itself was not tracked', () => {
    // `findNodeAndTower` resolves nothing for this id, so `end` takes its early return; the
    // timestamp must still be stamped so the trailing click is swallowed.
    const { result } = mountBrickMove('absent');

    dragBrick();

    expect(result.current()).toBe(true);
  });
});
