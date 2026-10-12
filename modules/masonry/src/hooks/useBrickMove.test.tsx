// Tests for `useBrickMove`'s interact.js wiring: the `enabled` option that tracks
// `!areBricksHidden`, and the drag-end stamping that suppresses the trailing click.
// The file is .tsx so it runs in the dom project — importing the hook pulls in
// interact.js, which expects a window at module scope.

import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';

import { makeEmptyExpression, makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import * as argumentConnect from '@/utils/argument-connect';
import { AUTO_PAN_MAX_STEP, DRAG_CLICK_SUPPRESSION_MS } from '@/utils/constants';
import * as statementConnect from '@/utils/statement-connect';

import { tryConnect, useBrickMove } from './useBrickMove';
import { traverseTopDown } from '@/utils/tower-traversal';

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
function mountClickBrickMove(id: string) {
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

// -------------------------------------------------------------------------------------------------

// The drag tests skip the pointer choreography too: they take the listeners out of the options the
// hook hands to `draggable` and call them by hand, the way `useCanvasPan`'s tests do.

const TOWER_ID = 'tower-1';
const BRICK_ID = 'brick-1';

/** The canvas the drag runs over, wide enough that the left and right bands don't overlap. */
const CANVAS_RECT = { left: 300, top: 100, width: 800, height: 600 };
const LEFT_EDGE = CANVAS_RECT.left;
const MIDDLE = CANVAS_RECT.left + CANVAS_RECT.width / 2;
const RIGHT_EDGE = CANVAS_RECT.left + CANVAS_RECT.width;

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

/** Runs up to `count` queued frames, including any a frame queues for the next one. */
function runFrames(count: number) {
  for (let i = 0; i < count; i++) {
    const next = [...frames.entries()][0];
    if (!next) return;
    frames.delete(next[0]);
    next[1](i);
  }
}

/** Mounts the hook on a brick and starts a drag. */
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

/** The viewport offset from the store. */
function offset() {
  return useWorkspaceViewportStore.getState().offset;
}

/** The dragged tower's position from the store. */
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
    useConnectionPreviewStore.getState().clearPreviewTarget();
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

    it('stops panning when it unmounts mid-drag', () => {
      const { unmount } = mountBrickMove();

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(1);
      unmount();

      expect(frames.size).toBe(0);
    });

    it('restarts panning on the next move after the effect re-runs mid-drag', () => {
      const { rerender } = mountBrickMove();

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(1);
      // New ref objects re-run the effect, the way a brick that remounts mid-drag does.
      rerender();
      expect(frames.size).toBe(0);

      listeners().move(pointerAt(LEFT_EDGE));
      runFrames(1);

      expect(offset().x).toBe(AUTO_PAN_MAX_STEP * 2);
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
      expect(frames.size).toBe(0);
    });

    it('refreshes the snap preview on each pan step', () => {
      mountBrickMove();

      listeners().move(pointerAt(LEFT_EDGE));
      // A preview left over from before the step, which the step has to replace.
      useConnectionPreviewStore.getState().setPreviewTarget(
        {
          draggedTowerId: TOWER_ID,
          targetTowerId: 'tower-2',
          targetBrickId: 'brick-2',
          type: 'statement',
          distance: 10,
          centroid: { x: 0, y: 0 },
        },
        true,
        { x: 0, y: 0 },
      );
      runFrames(1);

      expect(useConnectionPreviewStore.getState().activeTarget).toBeNull();
    });

    it('does not pan while the pointer is over the Trash', () => {
      // The Trash sits inside the right band, the way it does in the corner of the canvas.
      useTrashStore
        .getState()
        .setBounds({ x: RIGHT_EDGE - 60, y: CANVAS_RECT.top, w: 60, h: CANVAS_RECT.height });
      mountBrickMove();

      listeners().move(pointerAt(RIGHT_EDGE - 30));

      expect(frames.size).toBe(0);
    });
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
    const { result } = mountClickBrickMove('b0');

    dragBrick();

    expect(result.current()).toBe(true);
  });

  it('still reports suppression one tick inside the window', () => {
    seedTower('b0');
    const { result } = mountClickBrickMove('b0');

    dragBrick();
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS - 1);

    expect(result.current()).toBe(true);
  });

  it('stops reporting suppression once the window has elapsed', () => {
    seedTower('b0');
    const { result } = mountClickBrickMove('b0');

    dragBrick();
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS);

    expect(result.current()).toBe(false);
  });

  it('reports no suppression before the brick has ever been dragged', () => {
    seedTower('b0');
    const { result } = mountClickBrickMove('b0');

    expect(result.current()).toBe(false);
  });

  it('records the drag end even when the drop itself was not tracked', () => {
    // `findNodeAndTower` resolves nothing for this id, so `end` takes its early return; the
    // timestamp must still be stamped so the trailing click is swallowed.
    const { result } = mountClickBrickMove('absent');

    dragBrick();

    expect(result.current()).toBe(true);
  });
});

describe('tryConnect swapping bricks', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      towers: {},
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the evicted block to originPosition when originPosition is provided', () => {
    const host = makeEmptyExpression('host', 1);
    const tenant = makeEmptyValue('tenant');
    host.args[0] = tenant;
    tenant.parent = host;

    const hostTowerId = 'host-tower';
    const draggedTowerId = 'dragged-tower';
    const dragged = makeEmptyValue('dragged');

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
      store.createTower({ id: draggedTowerId, root: dragged, position: { x: 100, y: 100 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: host,
      child: dragged,
      slotIndex: 0,
      hostTowerId,
      absorbedTowerId: draggedTowerId,
      distance: 0,
      residentNode: tenant,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);
    const joinArgSpy = vi.spyOn(argumentConnect, 'joinArg').mockImplementation(() => {});

    const detachSpy = vi
      .spyOn(useWorkspaceStore.getState(), 'detachBrickToNewTower')
      .mockReturnValue('new-tower-id');

    const originPosition = { x: 123, y: 456 };
    act(() => {
      tryConnect(draggedTowerId, originPosition);
    });

    expect(detachSpy).toHaveBeenCalledWith(hostTowerId, 'tenant', originPosition);

    detachSpy.mockRestore();
    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
    joinArgSpy.mockRestore();
  });

  it('swaps a resident expression containing an argument into a separate tower and seats incoming brick without stubbing', () => {
    const host = makeEmptyExpression('host', 1);
    const residentExpr = makeEmptyExpression('resident-expr', 1);
    const residentArg = makeEmptyValue('resident-arg');
    residentExpr.args[0] = residentArg;
    residentArg.parent = residentExpr;
    host.args[0] = residentExpr;
    residentExpr.parent = host;

    const hostTowerId = 'host-tower';
    const draggedTowerId = 'dragged-tower';
    const dragged = makeEmptyValue('dragged');

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
      store.createTower({ id: draggedTowerId, root: dragged, position: { x: 100, y: 100 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: host,
      child: dragged,
      slotIndex: 0,
      hostTowerId,
      absorbedTowerId: draggedTowerId,
      distance: 0,
      residentNode: residentExpr,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);

    const originPosition = { x: 123, y: 456 };
    let connected = false;
    act(() => {
      connected = tryConnect(draggedTowerId, originPosition);
    });

    expect(connected).toBe(true);

    const latestStore = useWorkspaceStore.getState();
    const currentHost = latestStore.towers[hostTowerId]?.root;
    // Incoming brick occupies the host slot
    expect(currentHost).toBeDefined();
    expect('args' in currentHost! && currentHost.args[0]).toBe(dragged);
    expect(dragged.parent).toBe(currentHost);

    // Resident subtree becomes a separate tower
    const newTowers = Object.values(latestStore.towers).filter((t) => t.id !== hostTowerId);
    expect(newTowers).toHaveLength(1);
    const residentTower = newTowers[0];
    expect(residentTower.root).toBe(residentExpr);
    expect(residentExpr.parent).toBeNull();
    expect(residentExpr.args[0]).toBe(residentArg);
    expect(residentArg.parent).toBe(residentExpr);

    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
  });

  it('exchanges two argument blocks in the same tree when one is dropped onto the other', () => {
    const host = makeEmptyExpression('host', 2);
    const childA = makeEmptyValue('child-a');
    const childB = makeEmptyValue('child-b');
    // Initially host had childA in slot 0 and childB in slot 1.
    // When childA was detached during drag start, slot 0 was vacated (null).
    host.args[0] = null;
    host.args[1] = childB;
    childB.parent = host;

    const hostTowerId = 'host-tower';
    const draggedTowerId = 'dragged-tower-a';

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
      store.createTower({ id: draggedTowerId, root: childA, position: { x: 550, y: 500 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: host,
      child: childA,
      slotIndex: 1,
      hostTowerId,
      absorbedTowerId: draggedTowerId,
      distance: 0,
      residentNode: childB,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);

    const originSlot = {
      towerId: hostTowerId,
      parentId: 'host',
      slotIndex: 0,
    };

    let connected = false;
    act(() => {
      connected = tryConnect(draggedTowerId, { x: 500, y: 500 }, originSlot);
    });

    expect(connected).toBe(true);

    const latestStore = useWorkspaceStore.getState();
    const currentHost = latestStore.towers[hostTowerId]?.root;
    expect(currentHost).toBeDefined();

    // Verify both blocks swapped slots in the same tree!
    expect('args' in currentHost! && currentHost.args[0]).toBe(childB);
    expect('args' in currentHost! && currentHost.args[1]).toBe(childA);
    expect(childB.parent).toBe(currentHost);
    expect(childA.parent).toBe(currentHost);

    // No orphan towers left behind
    expect(Object.keys(latestStore.towers)).toEqual([hostTowerId]);

    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
  });

  it('falls back to safe extracted position when originPosition collides with a remaining tower', () => {
    const host = makeEmptyExpression('host', 1);
    const tenant = makeEmptyValue('tenant');
    host.args[0] = tenant;
    tenant.parent = host;

    const hostTowerId = 'host-tower';
    const draggedTowerId = 'dragged-tower';
    const dragged = makeEmptyValue('dragged');

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
      store.createTower({ id: draggedTowerId, root: dragged, position: { x: 100, y: 100 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: host,
      child: dragged,
      slotIndex: 0,
      hostTowerId,
      absorbedTowerId: draggedTowerId,
      distance: 0,
      residentNode: tenant,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);
    const joinArgSpy = vi.spyOn(argumentConnect, 'joinArg').mockImplementation(() => {});

    const detachSpy = vi
      .spyOn(useWorkspaceStore.getState(), 'detachBrickToNewTower')
      .mockReturnValue('new-tower-id');

    // Origin position directly overlapping the host tower at (500, 500)
    const collidingOrigin = { x: 500, y: 500 };
    act(() => {
      tryConnect(draggedTowerId, collidingOrigin);
    });

    expect(detachSpy).toHaveBeenCalled();
    const passedDropPos = detachSpy.mock.calls[0][2];
    expect(passedDropPos).not.toEqual(collidingOrigin);
    expect(passedDropPos.x).toBeGreaterThan(collidingOrigin.x);

    detachSpy.mockRestore();
    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
    joinArgSpy.mockRestore();
  });

  it('falls back to safe extracted position when originPosition is not provided (e.g. from palette)', () => {
    const host = makeEmptyExpression('host', 1);
    const tenant = makeEmptyValue('tenant');
    host.args[0] = tenant;
    tenant.parent = host;

    const hostTowerId = 'host-tower';
    const draggedTowerId = 'dragged-tower';
    const dragged = makeEmptyValue('dragged');

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
      store.createTower({ id: draggedTowerId, root: dragged, position: { x: 100, y: 100 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: host,
      child: dragged,
      slotIndex: 0,
      hostTowerId,
      absorbedTowerId: draggedTowerId,
      distance: 0,
      residentNode: tenant,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);
    const joinArgSpy = vi.spyOn(argumentConnect, 'joinArg').mockImplementation(() => {});

    const detachSpy = vi
      .spyOn(useWorkspaceStore.getState(), 'detachBrickToNewTower')
      .mockReturnValue('new-tower-id');

    act(() => {
      tryConnect(draggedTowerId);
    });

    expect(detachSpy).toHaveBeenCalledWith(
      hostTowerId,
      'tenant',
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    );

    detachSpy.mockRestore();
    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
    joinArgSpy.mockRestore();
  });

  it('sends the evicted block to absorbedTower position when hostTowerId is the dragged tower', () => {
    const dragged = makeEmptyExpression('dragged', 1);
    const tenant = makeEmptyValue('tenant');
    dragged.args[0] = tenant;
    tenant.parent = dragged;

    const hostTowerId = 'dragged-tower';
    const absorbedTowerId = 'absorbed-tower';
    const absorbed = makeEmptyValue('absorbed');

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: dragged, position: { x: 500, y: 500 } });
      store.createTower({ id: absorbedTowerId, root: absorbed, position: { x: 250, y: 350 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: dragged,
      child: absorbed,
      slotIndex: 0,
      hostTowerId,
      absorbedTowerId,
      distance: 0,
      residentNode: tenant,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);
    const joinArgSpy = vi.spyOn(argumentConnect, 'joinArg').mockImplementation(() => {});

    const detachSpy = vi
      .spyOn(useWorkspaceStore.getState(), 'detachBrickToNewTower')
      .mockReturnValue('new-tower-id');

    act(() => {
      tryConnect(hostTowerId, { x: 10, y: 20 });
    });

    expect(detachSpy).toHaveBeenCalledWith(hostTowerId, 'tenant', { x: 250, y: 350 });

    detachSpy.mockRestore();
    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
    joinArgSpy.mockRestore();
  });

  it('does not detach any block when the argument slot is empty', () => {
    const host = makeEmptyExpression('host', 1);
    const hostTowerId = 'host-tower';
    const draggedTowerId = 'dragged-tower';
    const dragged = makeEmptyValue('dragged');

    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
      store.createTower({ id: draggedTowerId, root: dragged, position: { x: 100, y: 100 } });
    });

    const resolveArgSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection').mockReturnValue({
      parent: host,
      child: dragged,
      slotIndex: 0,
      hostTowerId,
      absorbedTowerId: draggedTowerId,
      distance: 0,
      residentNode: null,
    });
    const resolveStmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(null);
    const joinArgSpy = vi.spyOn(argumentConnect, 'joinArg').mockImplementation(() => {});

    const detachSpy = vi.spyOn(useWorkspaceStore.getState(), 'detachBrickToNewTower');

    act(() => {
      tryConnect(draggedTowerId, { x: 50, y: 50 });
    });

    expect(detachSpy).not.toHaveBeenCalled();

    resolveArgSpy.mockRestore();
    resolveStmtSpy.mockRestore();
    joinArgSpy.mockRestore();
  });

  it('performs full drag lifecycle exchanging two arguments in the same tree without mocks', () => {
    const host = makeEmptyExpression('host', 2);
    const childA = makeEmptyValue('child-a');
    const childB = makeEmptyValue('child-b');
    host.args[0] = childA;
    childA.parent = host;
    host.args[1] = childB;
    childB.parent = host;

    const hostTowerId = 'tower-1';
    const store = useWorkspaceStore.getState();
    act(() => {
      store.createTower({ id: hostTowerId, root: host, position: { x: 500, y: 500 } });
    });

    // Run layout traversal to establish positions
    traverseTopDown(host, { x: 500, y: 500 });
    act(() => {
      store.syncStatementConnectors(hostTowerId, host);
      store.syncArgumentConnectors(hostTowerId, host);
    });

    const el = document.createElement('div');
    document.body.append(el);
    renderHook(() => useBrickMove('child-a', { current: el }));

    const dListeners = listeners();
    // 1. Start drag on child-a
    act(() => {
      dListeners.start(pointerAt(500));
    });

    // Determine target location: slot 1 groove center
    const input1 = host.model.getConnectorCoords().inputs[1];
    const targetSlotX = host.model.position.x + input1.x;
    const targetSlotY = host.model.position.y + input1.y;

    const childAOutput = childA.model.getConnectorCoords().output!;
    // Move dragged tower so childA's output tab aligns with slot 1
    const targetTowerX = targetSlotX - childAOutput.x;
    const targetTowerY = targetSlotY - childAOutput.y;

    const deltaX = targetTowerX - 500;
    const deltaY = targetTowerY - 500;

    act(() => {
      dListeners.move({ dx: deltaX, dy: deltaY, clientX: targetTowerX, clientY: targetTowerY });
    });

    // 2. End drag (drop onto slot 1)
    act(() => {
      dListeners.end({ clientX: targetTowerX, clientY: targetTowerY });
    });

    const latestStore = useWorkspaceStore.getState();
    const finalHost = latestStore.towers[hostTowerId]?.root;
    expect(finalHost).toBeDefined();
    expect('args' in finalHost! && finalHost.args[0]?.model.id).toBe('child-b');
    expect('args' in finalHost! && finalHost.args[1]?.model.id).toBe('child-a');
  });
});

