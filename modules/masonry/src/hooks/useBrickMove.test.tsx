// Tests for auto-pan during a brick drag. As in `useCanvasPan`'s tests, the draggable is mocked and
// its listeners driven by hand, and `requestAnimationFrame` is stubbed so frames can be stepped one
// at a time. The file is .tsx so it runs in the dom project.

import { cleanup, renderHook } from '@testing-library/react';
import interact from 'interactjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeEmptyStatement } from '@/mocks/tower';
import { useWorkspaceStore } from '@/stores/workspace';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { AUTO_PAN_MAX_STEP } from '@/utils/constants';

import { useBrickMove } from './useBrickMove';

// -------------------------------------------------------------------------------------------------

const { draggable, unset } = vi.hoisted(() => ({ draggable: vi.fn(), unset: vi.fn() }));

vi.mock('interactjs', () => ({
  default: vi.fn(() => ({
    draggable: (options: unknown) => {
      draggable(options);
      return { unset };
    },
  })),
}));

/** The canvas the drag runs over, wide enough that the left and right bands don't overlap. */
const CANVAS_RECT = { left: 300, top: 100, width: 800, height: 600 };

const LEFT_EDGE = CANVAS_RECT.left;
const MIDDLE = CANVAS_RECT.left + CANVAS_RECT.width / 2;
const RIGHT_EDGE = CANVAS_RECT.left + CANVAS_RECT.width;

const TOWER_ID = 'tower-1';
const BRICK_ID = 'brick-1';

/** The listeners the hook passed to `draggable`. */
function listeners() {
  return (
    draggable.mock.calls[0][0] as {
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

/** Mounts the hook on a brick over a measured canvas and starts a drag. */
function mountBrickMove({ withCanvas = true } = {}) {
  const brick = document.createElement('div');
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => CANVAS_RECT as DOMRect;

  const hook = renderHook(() =>
    useBrickMove(BRICK_ID, { current: brick }, withCanvas ? { current: canvas } : undefined),
  );

  listeners().start({});

  return hook;
}

function offset() {
  return useWorkspaceViewportStore.getState().offset;
}

function towerPosition() {
  return useWorkspaceStore.getState().towers[TOWER_ID].position;
}

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
  cleanup();
  vi.unstubAllGlobals();
  vi.mocked(interact).mockClear();
  draggable.mockClear();
  unset.mockClear();
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
  useWorkspaceStore.setState({ towers: {} });
});

// -------------------------------------------------------------------------------------------------

describe('useBrickMove auto-pan', () => {
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

  it('stops panning when it unmounts mid-drag', () => {
    const { unmount } = mountBrickMove();

    listeners().move(pointerAt(LEFT_EDGE));
    runFrames(1);
    unmount();

    expect(frames.size).toBe(0);
  });

  it('never pans without a canvas', () => {
    // `Tower` renders bricks without a canvas around them.
    mountBrickMove({ withCanvas: false });

    listeners().move(pointerAt(LEFT_EDGE));
    runFrames(3);

    expect(offset()).toEqual({ x: 0, y: 0 });
  });

  it('does not pan past the origin at the right edge', () => {
    // The viewport store clamps the offset at the origin, so only the left and top edges pan
    // from the start.
    mountBrickMove();

    listeners().move(pointerAt(RIGHT_EDGE));
    runFrames(3);

    expect(offset()).toEqual({ x: 0, y: 0 });
  });
});
