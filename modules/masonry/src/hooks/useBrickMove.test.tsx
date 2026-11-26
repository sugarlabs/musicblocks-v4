// Tests for `useBrickMove`'s interact.js wiring: the `enabled` option that tracks
// `!areBricksHidden`, and the drag-end stamping that suppresses the trailing click.
// The file is .tsx so it runs in the dom project — importing the hook pulls in
// interact.js, which expects a window at module scope.

import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';

import type { TowerState } from '@/@types/workspace.types';
import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import * as argumentConnect from '@/utils/argument-connect';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';
import {
  AUTO_PAN_MAX_STEP,
  DRAG_CLICK_SUPPRESSION_MS,
  SNAP_RESOLUTION_THRESHOLD_PX,
} from '@/utils/constants';
import * as snapCalc from '@/utils/snap-preview-calculator';
import * as statementConnect from '@/utils/statement-connect';

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

/** Builds a workspace with `count` statement towers and registers connectors. */
function setupWorkspace(count = 1) {
  useWorkspaceStore.setState({
    towers: {},
    selectedBrickId: null,
    statementConnectors: {},
    argumentConnectors: {},
  });
  const towers: Record<string, TowerState> = {};
  for (let i = 0; i < count; i++) {
    const id = `b-${i}`;
    const tid = `t-${i}`;
    const model = createBrickModel(
      {
        kind: 'statement',
        widget: { type: 'label', text: id },
        colorsDefault: { background: '#123', foreground: '#fff', border: '#000' },
        tooltipText: id,
        hasConnectionPrev: true,
        hasConnectionNext: true,
      },
      id,
    );
    const node = wrapAsRootNode(model);
    const pos = { x: (i % 6) * 150, y: Math.floor(i / 6) * 100 };
    model.setPosition(pos.x, pos.y);
    towers[tid] = { id: tid, root: node, position: pos };
    useBrickLayoutStore.getState().setCoords(id, pos);
    useBrickLayoutStore.getState().setMounted({ [id]: true });
    useBrickLayoutStore.getState().setPositioned({ [id]: true });
  }
  useWorkspaceStore.setState({ towers });
  for (const tid of Object.keys(towers)) {
    useWorkspaceStore.getState().syncStatementConnectors(tid, towers[tid].root);
    useWorkspaceStore.getState().syncArgumentConnectors(tid, towers[tid].root);
  }
  return { id: 'b-0', towerId: 't-0' };
}

describe('useBrickMove connection resolution optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useConnectionPreviewStore.getState().clearPreviewTarget();
    useTrashStore.getState().setHovered(false);
  });

  it('resolves on first move, skips below threshold, triggers when accumulated >= 3px', () => {
    expect(SNAP_RESOLUTION_THRESHOLD_PX).toBe(3);
    const { id } = setupWorkspace(1);
    const el = document.createElement('div');
    renderHook(() => useBrickMove(id, { current: el }));
    const l = dragListeners();
    const spy = vi.spyOn(snapCalc, 'resolveCandidateConnection');

    l.start({ target: el, clientX: 100, clientY: 100 });
    l.move({ dx: 1, dy: 1, clientX: 101, clientY: 101 });
    expect(spy).toHaveBeenCalledTimes(1);

    l.move({ dx: 0.5, dy: 0.5, clientX: 101.5, clientY: 101.5 });
    expect(spy).toHaveBeenCalledTimes(1);
    // Tower position still updated even when resolution is skipped.
    expect(useWorkspaceStore.getState().towers['t-0'].position).toEqual({ x: 1.5, y: 1.5 });

    l.move({ dx: 3, dy: 0, clientX: 104.5, clientY: 101.5 });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('updates and clears preview target, handling trash boundary properly', () => {
    const { id } = setupWorkspace(1);
    const el = document.createElement('div');
    renderHook(() => useBrickMove(id, { current: el }));
    useTrashStore.getState().setBounds({ x: 500, y: 500, w: 100, h: 100 });
    const l = dragListeners();
    const spy = vi.spyOn(snapCalc, 'resolveCandidateConnection');

    l.start({ target: el, clientX: 100, clientY: 100 });
    l.move({ dx: 10, dy: 10, clientX: 110, clientY: 110 });
    expect(spy).toHaveBeenCalledTimes(1);

    l.move({ dx: 400, dy: 400, clientX: 550, clientY: 550 });
    expect(useTrashStore.getState().isHovered).toBe(true);
    expect(useConnectionPreviewStore.getState().activeTarget).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);

    l.move({ dx: -400, dy: -400, clientX: 110, clientY: 110 });
    expect(useTrashStore.getState().isHovered).toBe(false);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('synchronizes final drop position with preview snap position on drag end', () => {
    const { id } = setupWorkspace(1);
    const el = document.createElement('div');
    renderHook(() => useBrickMove(id, { current: el }));
    const l = dragListeners();
    const snapPos = { x: 205, y: 220 };
    const mockSpy = vi.spyOn(snapCalc, 'resolveCandidateConnection').mockReturnValue({
      target: {
        draggedTowerId: 't-0',
        targetTowerId: 't-h',
        targetBrickId: 'b-h',
        type: 'statement',
        distance: 8,
        centroid: { x: 200, y: 200 },
      },
      isValid: true,
      snapPosition: snapPos,
    });

    l.start({ target: el, clientX: 100, clientY: 100 });
    l.move({ dx: 10, dy: 10, clientX: 110, clientY: 110 });
    expect(useConnectionPreviewStore.getState().snapPosition).toEqual(snapPos);

    l.end({ clientX: 110, clientY: 110 });
    expect(useConnectionPreviewStore.getState().activeTarget).toBeNull();
    // Tower snapped to the previewed position, not the raw drag-end position.
    expect(useWorkspaceStore.getState().towers['t-0'].position).toEqual(snapPos);
    mockSpy.mockRestore();
  });

  it('joins the previewed target when multiple connectors compete', () => {
    const { id } = setupWorkspace(1);
    const el = document.createElement('div');
    renderHook(() => useBrickMove(id, { current: el }));
    const l = dragListeners();

    const targetA = {
      draggedTowerId: 't-0',
      targetTowerId: 'tower-a',
      targetBrickId: 'brick-a',
      type: 'statement' as const,
      distance: 12,
      centroid: { x: 100, y: 100 },
    };

    useConnectionPreviewStore.getState().setPreviewTarget(targetA, true, { x: 100, y: 100 });

    const stmtConnA = {
      parent: { model: { id: 'brick-a' } },
      child: { model: { id: 'b-0' } },
      socket: 'next' as const,
      hostTowerId: 'tower-a',
      absorbedTowerId: 't-0',
      distance: 15,
    };
    const argConnB = {
      parent: { model: { id: 'brick-b' } },
      child: { model: { id: 'b-0' } },
      slotIndex: 0,
      hostTowerId: 'tower-b',
      absorbedTowerId: 't-0',
      distance: 5,
    };

    const stmtSpy = vi
      .spyOn(statementConnect, 'resolveStatementConnection')
      .mockReturnValue(stmtConnA as never);
    const argSpy = vi
      .spyOn(argumentConnect, 'resolveArgumentConnection')
      .mockReturnValue(argConnB as never);
    const joinStmtSpy = vi.spyOn(statementConnect, 'joinStatement').mockImplementation(() => {});
    const joinArgSpy = vi.spyOn(argumentConnect, 'joinArg').mockImplementation(() => {});
    const absorbSpy = vi
      .spyOn(useWorkspaceStore.getState(), 'absorbTower')
      .mockImplementation(() => {});

    l.start({ target: el, clientX: 100, clientY: 100 });
    l.end({ clientX: 100, clientY: 100 });

    expect(joinStmtSpy).toHaveBeenCalledWith(stmtConnA);
    expect(joinArgSpy).not.toHaveBeenCalled();
    joinStmtSpy.mockRestore();
    joinArgSpy.mockRestore();
    absorbSpy.mockRestore();
    stmtSpy.mockRestore();
    argSpy.mockRestore();
  });

  it('joins the previewed statement target when competing same-type connectors exist', () => {
    setupWorkspace(2);

    const draggedModel = createBrickModel(
      {
        kind: 'statement',
        widget: { type: 'label', text: 'b-2' },
        colorsDefault: { background: '#123', foreground: '#fff', border: '#000' },
        tooltipText: 'b-2',
        hasConnectionPrev: true,
        hasConnectionNext: true,
      },
      'b-2',
    );
    const draggedNode = wrapAsRootNode(draggedModel);
    const draggedPos = { x: 0, y: 35 };
    draggedModel.setPosition(draggedPos.x, draggedPos.y);

    useWorkspaceStore.setState({
      towers: {
        ...useWorkspaceStore.getState().towers,
        't-2': { id: 't-2', root: draggedNode, position: draggedPos },
      },
    });
    useBrickLayoutStore.getState().setCoords('b-2', draggedPos);
    useBrickLayoutStore.getState().setMounted({ 'b-2': true });
    useBrickLayoutStore.getState().setPositioned({ 'b-2': true });

    const el = document.createElement('div');
    renderHook(() => useBrickMove('b-2', { current: el }));
    const l = dragListeners();

    const previewTarget = {
      draggedTowerId: 't-2',
      targetTowerId: 't-0',
      targetBrickId: 'b-0',
      type: 'statement' as const,
      distance: 5,
      centroid: { x: 0, y: 30 },
    };
    useConnectionPreviewStore.getState().setPreviewTarget(previewTarget, true, { x: 0, y: 30 });

    l.start({ target: el, clientX: 0, clientY: 35 });
    l.end({ clientX: 0, clientY: 35 });

    const store = useWorkspaceStore.getState();
    const tower0Root = store.towers['t-0'].root;
    const tower1Root = store.towers['t-1'].root;
    expect(tower0Root.kind).toBe('statement');
    expect(tower1Root.kind).toBe('statement');
    if (tower0Root.kind === 'statement') {
      expect(tower0Root.next?.model.id).toBe('b-2');
    }
    if (tower1Root.kind === 'statement') {
      expect(tower1Root.next).toBeNull();
    }
    expect(store.towers['t-2']).toBeUndefined();
  });

  it('reduces connection resolution calls for sub-threshold moves across 24 towers', () => {
    setupWorkspace(24);
    const el = document.createElement('div');
    renderHook(() => useBrickMove('b-0', { current: el }));
    const l = dragListeners();
    const spy = vi.spyOn(snapCalc, 'resolveCandidateConnection');
    const stmtSpy = vi.spyOn(statementConnect, 'resolveStatementConnection');
    const argSpy = vi.spyOn(argumentConnect, 'resolveArgumentConnection');

    l.start({ target: el, clientX: 0, clientY: 0 });
    for (let i = 0; i < 100; i++) {
      l.move({
        dx: i % 2 === 0 ? 0.5 : 10,
        dy: i % 2 === 0 ? 0.5 : 10,
        clientX: 100 + i,
        clientY: 100 + i,
      });
    }
    expect(spy.mock.calls.length).toBe(51);
    expect(stmtSpy.mock.calls.length).toBe(51);
    expect(argSpy.mock.calls.length).toBe(51);
    l.end({ clientX: 100, clientY: 100 });
  });
});
