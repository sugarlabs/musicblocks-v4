// Tests for the menu closing once its brick is gone from the canvas. The file is .tsx so it runs in
// the dom project: the hook is judged against what a mounted canvas reports it is drawing, so a
// rendered harness is what the assertions go through.

import { cleanup, render } from '@testing-library/react';
import { act, useMemo } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { makeEmptyStatement, statementTreeWithNesting } from '@/mocks/tower';
import { useActionMenuStore } from '@/stores/actionMenu';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';
import { exportWorkspace } from '@/utils/import-export';
import { listVisibleNodes } from '@/utils/tower-traversal';
import { discardTower } from '@/utils/towerDiscard';

import { useActionMenuTarget } from './useActionMenuTarget';

// -------------------------------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  useActionMenuStore.setState({ brickId: null });
  useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
});

/**
 * Stands in for the canvas the hook is mounted on, listing what it draws exactly as `Workspace`
 * does so the hook is fed the same input in the same order. It renders nothing of its own.
 */
function Harness() {
  const towersRecord = useWorkspaceStore((state) => state.towers);
  const visibleNodes = useMemo(
    () => Object.values(towersRecord).flatMap((tower) => listVisibleNodes(tower.root)),
    [towersRecord],
  );

  useActionMenuTarget(visibleNodes);

  return null;
}

/**
 * A nesting brick holding a two-brick chain, with a brick following it, seated as `tower-f`.
 *
 * The cavity is what makes it useful here: `inner` is hidden by a fold on `outer`, while `outer`
 * and `tail` stay on screen through the same fold.
 */
function setupFoldableTower() {
  const outer = makeEmptyStatement('outer', 0, true);
  const inner = makeEmptyStatement('inner', 0, false);
  const innerNext = makeEmptyStatement('inner-next', 0, false);
  const tail = makeEmptyStatement('tail', 0, false);

  outer.nestedNext = inner;
  inner.prev = outer;
  inner.next = innerNext;
  innerNext.prev = inner;
  outer.next = tail;
  tail.prev = outer;

  act(() => {
    useWorkspaceStore.getState().createTower({
      id: 'tower-f',
      root: outer,
      position: { x: 200, y: 150 },
    });
  });
}

/** Mounts the harness with the menu already open on a brick. */
function openOn(brickId: string) {
  const view = render(<Harness />);

  act(() => {
    useActionMenuStore.getState().open(brickId);
  });

  return view;
}

/** The brick the store currently holds. */
function openBrick(): string | null {
  return useActionMenuStore.getState().brickId;
}

// -------------------------------------------------------------------------------------------------

describe('useActionMenuTarget', () => {
  it('closes when the tower holding its brick is discarded', () => {
    setupFoldableTower();
    openOn('tail');

    act(() => {
      discardTower('tower-f');
    });

    expect(openBrick()).toBeNull();
  });

  it('leaves the menu open when some other tower is discarded', () => {
    setupFoldableTower();
    act(() => {
      useWorkspaceStore.getState().createTower({
        id: 'tower-other',
        root: makeEmptyStatement('elsewhere', 0, false),
        position: { x: 0, y: 0 },
      });
    });
    openOn('tail');

    act(() => {
      discardTower('tower-other');
    });

    expect(openBrick()).toBe('tail');
  });

  it('closes when an import replaces the workspace', () => {
    setupFoldableTower();
    openOn('tail');

    const payload = JSON.parse(
      JSON.stringify(
        exportWorkspace({
          source: {
            id: 'source',
            root: statementTreeWithNesting,
            position: { x: 10, y: 20 },
          },
        }),
      ),
    );

    act(() => {
      useWorkspaceStore.getState().importWorkspace(payload);
    });

    expect(openBrick()).toBeNull();
  });

  it('closes when a fold shuts the cavity its brick sits in', () => {
    setupFoldableTower();
    openOn('inner');

    act(() => {
      useWorkspaceStore.getState().setNestingFold('outer', true);
    });

    expect(openBrick()).toBeNull();
  });

  it('leaves the menu open on the brick carrying the fold, which stays on screen', () => {
    setupFoldableTower();
    openOn('outer');

    act(() => {
      useWorkspaceStore.getState().setNestingFold('outer', true);
    });

    expect(openBrick()).toBe('outer');
  });

  it('leaves the menu open on a brick the fold only moves, not hides', () => {
    setupFoldableTower();
    openOn('tail');

    act(() => {
      useWorkspaceStore.getState().setNestingFold('outer', true);
    });

    expect(openBrick()).toBe('tail');
  });

  it('reopens the menu path once the fold lifts, the brick being a target again', () => {
    setupFoldableTower();
    openOn('inner');

    act(() => {
      useWorkspaceStore.getState().setNestingFold('outer', true);
    });
    expect(openBrick()).toBeNull();

    act(() => {
      useWorkspaceStore.getState().setNestingFold('outer', false);
      useActionMenuStore.getState().open('inner');
    });

    expect(openBrick()).toBe('inner');
  });

  it('holds the entry through a tower move, the menu being placed off `coords`', () => {
    setupFoldableTower();
    openOn('tail');

    act(() => {
      useWorkspaceStore.getState().updateTowerPosition('tower-f', { x: 640, y: 480 });
    });

    expect(openBrick()).toBe('tail');
    expect(useWorkspaceStore.getState().towers['tower-f'].position).toEqual({ x: 640, y: 480 });
  });

  it('stops watching when the canvas unmounts', () => {
    setupFoldableTower();
    const { unmount } = openOn('tail');

    unmount();

    act(() => {
      discardTower('tower-f');
    });

    // Nothing left drawing the bricks, so the id stands rather than closing behind the canvas's
    // back: whatever mounts next reports what it draws and the menu is judged against that.
    expect(openBrick()).toBe('tail');
  });
});
