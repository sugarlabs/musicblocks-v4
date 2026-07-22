// Unit test for the whole-tower drag + snap-join hook. interact.js pointer choreography isn't
// reproducible under jsdom, so we mock the module to capture the drag listeners per bound element
// and drive start/move/end by hand. jsdom also reports `offsetParent` as null (it computes no
// layout), so the harness stubs it — the hook reads it to locate the canvas.

import { act, cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerExpressionNode, TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';

import { useBrickLayoutStore } from '@/stores/brick';
import { resetSnapEngine } from '@/stores/snap';
import { useWorkspaceStore } from '@/stores/workspace';
import { listNodes } from '@/utils/tower-traversal';

import { useBrickMove } from './useBrickMove';

interface DragListeners {
  start: (event: unknown) => void;
  move: (event: unknown) => void;
  end: (event: unknown) => void;
}

// Captures the listeners each `useBrickMove` binds, keyed by the DOM element interact was called on.
const { listenersByEl } = vi.hoisted(() => ({
  listenersByEl: new Map<HTMLElement, DragListeners>(),
}));

vi.mock('interactjs', () => ({
  default: (el: HTMLElement) => ({
    draggable: (config: { listeners: DragListeners }) => {
      listenersByEl.set(el, config.listeners);
      return { unset: () => listenersByEl.delete(el) };
    },
  }),
}));

// -------------------------------------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------------------------------------

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

/** A standalone statement node with both sequence connectors open. */
function makeStatement(id: string): TowerStatementNode {
  return {
    kind: 'statement',
    model: new StatementBrickModel({
      id,
      colorsDefault,
      tooltipText: '',
      widget: { type: 'label', text: id },
      params: [],
      hasConnectionPrev: true,
      hasConnectionNext: true,
      hasNesting: false,
    }),
    prev: null,
    next: null,
    args: [],
    nestedNext: undefined,
  };
}

/** Links a run of statement nodes head→tail via prev/next; returns the head. */
function chain(...nodes: TowerStatementNode[]): TowerStatementNode {
  nodes.forEach((node, i) => {
    node.prev = nodes[i - 1] ?? null;
    node.next = nodes[i + 1] ?? null;
  });
  return nodes[0];
}

/** A free-floating value node — its output tab is the arg-domain probe. */
function makeValue(id: string): TowerValueNode {
  return {
    kind: 'value',
    model: new ValueBrickModel({
      id,
      colorsDefault,
      tooltipText: '',
      widget: { type: 'numberbox', value: 0 },
    }),
    parent: null,
  };
}

/** An expression node with one empty argument slot per `params` entry. */
function makeExpression(id: string, params: [string, ...string[]]): TowerExpressionNode {
  return {
    kind: 'expression',
    model: new ExpressionBrickModel({
      id,
      colorsDefault,
      tooltipText: '',
      widget: { type: 'label', text: id },
      params,
    }),
    parent: null,
    args: params.map(() => null),
  };
}

/** A brick that binds the drag hook and positions itself from the layout store, like TowerBrick. */
function Brick({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useBrickMove(id, ref);
  const coord = useBrickLayoutStore((state) => state.coords[id]);
  return (
    <div ref={ref} data-id={id} style={{ transform: `translate(${coord.x}px, ${coord.y}px)` }} />
  );
}

/** Renders the given bricks inside a positioned canvas and stubs the jsdom layout the hook reads. */
function renderCanvas(ids: string[]) {
  const utils = render(
    <div data-testid="canvas" style={{ position: 'relative' }}>
      {ids.map((id) => (
        <Brick key={id} id={id} />
      ))}
    </div>,
  );

  const canvas = utils.getByTestId('canvas');
  Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 800 });
  Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 600 });

  const brickEl = (id: string) => {
    const el = canvas.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
    // The hook uses `el.offsetParent` as the canvas; jsdom returns null, so point it at the canvas.
    Object.defineProperty(el, 'offsetParent', { configurable: true, value: canvas });
    return el;
  };
  ids.forEach(brickEl);

  return { ...utils, canvas, brickEl };
}

/** Returns the captured drag listeners for the brick with the given id. */
function listenersFor(brickEl: (id: string) => HTMLElement, id: string): DragListeners {
  const listeners = listenersByEl.get(brickEl(id));
  if (!listeners) throw new Error(`no drag listeners bound for brick ${id}`);
  return listeners;
}

// -------------------------------------------------------------------------------------------------

beforeEach(() => {
  useWorkspaceStore.setState({ towers: {} });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  resetSnapEngine();
  listenersByEl.clear();
});

afterEach(() => {
  cleanup();
});

describe('useBrickMove', () => {
  it('translates every tower brick via the DOM on move, leaving the store untouched', () => {
    const root = chain(makeStatement('S1'), makeStatement('S2'));
    useWorkspaceStore.getState().createTower({ id: 'tw', root, position: { x: 0, y: 0 } });
    useBrickLayoutStore.getState().setCoords({ S1: { x: 10, y: 20 }, S2: { x: 10, y: 120 } });
    useBrickLayoutStore.getState().setMounted({ S1: true, S2: true });

    const { brickEl } = renderCanvas(['S1', 'S2']);
    const listeners = listenersFor(brickEl, 'S1');

    act(() => listeners.start({}));
    act(() => listeners.move({ dx: 30, dy: 40 }));
    act(() => listeners.move({ dx: 5, dy: -10 })); // accumulated delta = (35, 30)

    // Both bricks in the tower move together, written straight to the DOM.
    expect(brickEl('S1').style.transform).toBe('translate(45px, 50px)');
    expect(brickEl('S2').style.transform).toBe('translate(45px, 150px)');

    // The layout store still holds the START coords — move wrote only to the DOM, so no re-render.
    expect(useBrickLayoutStore.getState().coords).toEqual({
      S1: { x: 10, y: 20 },
      S2: { x: 10, y: 120 },
    });
  });

  it('commits the dropped coords and reconciles the tower origin on a drop with no snap', () => {
    const root = makeStatement('S1');
    useWorkspaceStore.getState().createTower({ id: 'tw', root, position: { x: 100, y: 100 } });
    useBrickLayoutStore.getState().setCoords({ S1: { x: 100, y: 100 } });
    useBrickLayoutStore.getState().setMounted({ S1: true });

    const { brickEl } = renderCanvas(['S1']);
    const listeners = listenersFor(brickEl, 'S1');

    act(() => listeners.start({}));
    act(() => listeners.move({ dx: 30, dy: 40 }));
    act(() => listeners.end({}));

    // The only tower has no snap targets, so it stays free with coords + origin reconciled to the drop.
    expect(useBrickLayoutStore.getState().coords.S1).toEqual({ x: 130, y: 140 });
    expect(useWorkspaceStore.getState().towers.tw.position).toEqual({ x: 130, y: 140 });
    expect(Object.keys(useWorkspaceStore.getState().towers)).toEqual(['tw']);
  });

  it('snap-joins onto a target connector in range and absorbs the dragged tower', () => {
    const target = makeStatement('T');
    const dragged = makeStatement('D');
    useWorkspaceStore
      .getState()
      .createTower({ id: 'target', root: target, position: { x: 0, y: 0 } });
    useWorkspaceStore
      .getState()
      .createTower({ id: 'dragged', root: dragged, position: { x: 0, y: 0 } });

    const pTarget: Point = { x: 200, y: 200 };
    const pDraggedStart: Point = { x: 400, y: 400 };
    useBrickLayoutStore.getState().setCoords({ T: pTarget, D: pDraggedStart });
    useBrickLayoutStore.getState().setMounted({ T: true, D: true });

    // Move the dragged tower so its open `prev` groove lands exactly on the target's open `next` tab:
    //   (pDraggedStart + delta) + draggedPrev === pTarget + targetNext
    const targetNext = target.model.getConnectorCoords().next!;
    const draggedPrev = dragged.model.getConnectorCoords().prev!;
    const delta: Point = {
      x: pTarget.x + targetNext.x - draggedPrev.x - pDraggedStart.x,
      y: pTarget.y + targetNext.y - draggedPrev.y - pDraggedStart.y,
    };

    const { brickEl } = renderCanvas(['T', 'D']);
    const listeners = listenersFor(brickEl, 'D');

    act(() => listeners.start({}));
    act(() => listeners.move({ dx: delta.x, dy: delta.y }));
    act(() => listeners.end({}));

    const { towers } = useWorkspaceStore.getState();
    // The dragged tower is absorbed into the target, whose layout is bumped to re-run.
    expect(towers.dragged).toBeUndefined();
    expect(towers.target).toBeDefined();
    expect(towers.target.layoutVersion).toBe(1);
    // Both bricks are reachable from the survivor's root by forward pointers.
    const ids = listNodes(towers.target.root).map((node) => node.model.id);
    expect(ids).toEqual(expect.arrayContaining(['T', 'D']));
  });

  it('arg-snaps a dragged value output onto an empty input slot and absorbs the tower', () => {
    const target = makeExpression('E', ['A']); // one empty argument slot
    const dragged = makeValue('V');
    useWorkspaceStore
      .getState()
      .createTower({ id: 'target', root: target, position: { x: 0, y: 0 } });
    useWorkspaceStore
      .getState()
      .createTower({ id: 'dragged', root: dragged, position: { x: 0, y: 0 } });

    const pTarget: Point = { x: 200, y: 200 };
    const pDraggedStart: Point = { x: 400, y: 400 };
    useBrickLayoutStore.getState().setCoords({ E: pTarget, V: pDraggedStart });
    useBrickLayoutStore.getState().setMounted({ E: true, V: true });

    // Move the dragged value so its output tab lands exactly on the target's empty input slot:
    //   (pDraggedStart + delta) + draggedOutput === pTarget + targetInput
    const targetInput = target.model.getConnectorCoords().inputs[0].bounds;
    const draggedOutput = dragged.model.getConnectorCoords().output!;
    const delta: Point = {
      x: pTarget.x + targetInput.x - draggedOutput.x - pDraggedStart.x,
      y: pTarget.y + targetInput.y - draggedOutput.y - pDraggedStart.y,
    };

    const { brickEl } = renderCanvas(['E', 'V']);
    const listeners = listenersFor(brickEl, 'V');

    act(() => listeners.start({}));
    act(() => listeners.move({ dx: delta.x, dy: delta.y }));
    act(() => listeners.end({}));

    const { towers } = useWorkspaceStore.getState();
    // The dragged value tower is absorbed into the target, whose layout is bumped to re-run.
    expect(towers.dragged).toBeUndefined();
    expect(towers.target).toBeDefined();
    expect(towers.target.layoutVersion).toBe(1);
    // The value is now wired into the expression's slot 0, with its parent back-pointer set.
    const survivor = towers.target.root as TowerExpressionNode;
    expect(survivor.args[0]).toBe(dragged);
    expect(dragged.parent).toBe(survivor);
  });

  it('falls back to moving only the grabbed brick via the store when it has no owning tower', () => {
    // The brick exists in the layout store but belongs to no workspace tower.
    useBrickLayoutStore.getState().setCoords({ orphan: { x: 50, y: 60 } });
    useBrickLayoutStore.getState().setMounted({ orphan: true });

    const { brickEl } = renderCanvas(['orphan']);
    const listeners = listenersFor(brickEl, 'orphan');

    act(() => listeners.start({}));
    act(() => listeners.move({ dx: 15, dy: 25 }));

    expect(useBrickLayoutStore.getState().coords.orphan).toEqual({ x: 65, y: 85 });
  });
});
