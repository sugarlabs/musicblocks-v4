// Tests for what `areBricksHidden` does to `useBrickMove`'s interact.js wiring. As
// useDragFromPalette.test.tsx and Workspace.test.tsx note, real interact.js pointer choreography
// (pointerdown/move/up sequences) is not reproducible reliably under jsdom, so drag lifecycle
// behavior itself is not simulated here. What this file *can* verify without that: which options
// `useBrickMove` hands to `interact(el).draggable(...)` — specifically that `enabled` tracks
// `!areBricksHidden` — since disabling the interaction there is what keeps a hidden brick from ever
// starting a drag (and, by extension, ever touching the Trash-hover or snap-preview stores). The
// file is .tsx so it runs in the dom project — importing the hook pulls in interact.js, which
// expects a window at module scope.

import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { makeEmptyStatement } from '@/mocks/tower';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { AUTO_PAN_MAX_STEP } from '@/utils/constants';
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

/** Mounts `useBrickMove` on a plain div, the same way `TowerBrickView` does. */
function MoveHarness({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useBrickMove(id, ref);
  return <div ref={ref} />;
}

/** Options object from the most recent `interact(el).draggable(...)` call. */
function lastDraggableOptions() {
  const calls = interactableMock.draggable.mock.calls;
  return calls[calls.length - 1][0] as { enabled: boolean };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  act(() => {
    useWorkspaceStore.setState({ areBricksHidden: false });
  });
});

describe('useBrickMove', () => {
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

// -------------------------------------------------------------------------------------------------

// The drag tests skip the pointer choreography too: they take the listeners out of the options the
// hook hands to `draggable` and call them by hand, the way `useCanvasPan`'s tests do.

const TOWER_ID = 'tower-1';
const BRICK_ID = 'brick-1';

/** The canvas the drag runs over, wide enough that the left and right bands don't overlap. */
const CANVAS_RECT = { left: 300, top: 100, width: 800, height: 600 };
const LEFT_EDGE = CANVAS_RECT.left;
const MIDDLE = CANVAS_RECT.left + CANVAS_RECT.width / 2;

/** The listeners from the most recent `interact(el).draggable(...)` call. */
function listeners() {
  const calls = interactableMock.draggable.mock.calls;
  return (
    calls[calls.length - 1][0] as {
      listeners: {
        start: (event: unknown) => void;
        move: (event: { dx: number; dy: number; clientX: number; clientY: number }) => void;
        end: (event: { clientX: number; clientY: number }) => void;
      };
    }
  ).listeners;
}

/** A pointer at `clientX`, halfway down the canvas. */
function pointerAt(clientX: number) {
  return { dx: 0, dy: 0, clientX, clientY: CANVAS_RECT.top + CANVAS_RECT.height / 2 };
}

// jsdom doesn't run animation frames, so the loop is stepped by hand.
const frames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;

function runFrames(count: number) {
  for (let i = 0; i < count; i++) {
    const next = [...frames.entries()][0];
    if (!next) return;
    frames.delete(next[0]);
    next[1](i);
  }
}

/** Mounts the hook on a brick and starts a drag. */
function mountBrickMove() {
  const brick = document.createElement('div');
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => CANVAS_RECT as DOMRect;

  const hook = renderHook(() => useBrickMove(BRICK_ID, { current: brick }, { current: canvas }));

  listeners().start({});

  return hook;
}

function offset() {
  return useWorkspaceViewportStore.getState().offset;
}

function towerPosition() {
  return useWorkspaceStore.getState().towers[TOWER_ID].position;
}

describe('useBrickMove drag', () => {
  beforeEach(() => {
    frames.clear();
    nextFrameId = 1;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.set(nextFrameId, cb);
      return nextFrameId++;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));

    useWorkspaceStore.setState({
      towers: {
        [TOWER_ID]: {
          id: TOWER_ID,
          root: makeEmptyStatement(BRICK_ID, 0),
          position: { x: 400, y: 300 },
        },
      },
    });
  });

  afterEach(() => {
    // Unmounted before the stubs go, since unmounting can cancel a pending frame.
    cleanup();
    vi.unstubAllGlobals();
    useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
    useWorkspaceStore.setState({ towers: {} });
    useTrashStore.setState({ bounds: null, isHovered: false });
  });

  it('moves the dragged tower by the pointer delta', () => {
    mountBrickMove();

    listeners().move({ dx: 10, dy: 5, clientX: 0, clientY: 0 });
    listeners().move({ dx: 10, dy: 5, clientX: 0, clientY: 0 });

    expect(towerPosition()).toEqual({ x: 420, y: 310 });
  });

  it('highlights the Trash while the pointer is over it and clears it on drop', () => {
    useTrashStore.getState().setBounds({ x: 0, y: 0, w: 50, h: 50 });
    mountBrickMove();

    listeners().move({ dx: 0, dy: 0, clientX: 25, clientY: 25 });
    expect(useTrashStore.getState().isHovered).toBe(true);

    listeners().end({ clientX: 100, clientY: 100 });
    expect(useTrashStore.getState().isHovered).toBe(false);
  });

  describe('auto-pan', () => {
    it('does not start panning in the middle of the canvas', () => {
      mountBrickMove();

      listeners().move(pointerAt(MIDDLE));

      expect(frames.size).toBe(0);
    });

    it('pans every frame while the pointer is held at an edge', () => {
      mountBrickMove();

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(3);

      expect(offset().x).toBe(AUTO_PAN_MAX_STEP * 3);
    });

    it('moves the dragged tower back so the brick stays under the pointer', () => {
      mountBrickMove();
      const before = towerPosition().x;

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(2);

      // The brick is drawn at offset + tower position, so that sum should not change.
      expect(towerPosition().x).toBe(before - AUTO_PAN_MAX_STEP * 2);
      expect(offset().x + towerPosition().x).toBe(before);
    });

    it('stops panning once the pointer leaves the band', () => {
      mountBrickMove();

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(1);
      listeners().move(pointerAt(MIDDLE));
      runFrames(3);

      expect(offset().x).toBe(AUTO_PAN_MAX_STEP);
    });

    it('stops panning when the drag ends', () => {
      mountBrickMove();

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(1);
      listeners().end(pointerAt(LEFT_EDGE));

      expect(frames.size).toBe(0);
    });
  });
});
