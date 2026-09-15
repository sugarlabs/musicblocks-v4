// Tests for the hook that pushes the workspace scale level onto the bricks. The file is .tsx so it
// runs in the dom project — the hook's work happens in an effect, so it has to be mounted.

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeEmptyExpression, makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { DEFAULT_SCALE_LEVEL, MAX_SCALE_LEVEL } from '@/utils/constants';
import { listNodes } from '@/utils/tower-traversal';

import { useWorkspaceScale } from './useWorkspaceScale';

// -------------------------------------------------------------------------------------------------

/** A statement with a filled argument slot and a brick in its nesting cavity. */
function makeNestedTower(id: string) {
  const root = makeEmptyStatement(id, 1, true);
  const arg = makeEmptyValue(`${id}-arg`);
  const nested = makeEmptyStatement(`${id}-nested`, 0);

  root.args[0] = arg;
  arg.parent = root;
  root.nestedNext = nested;
  nested.prev = root;

  return root;
}

describe('useWorkspaceScale', () => {
  beforeEach(() => {
    act(() => {
      useWorkspaceStore.setState({ towers: {} });
      useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });
    });
  });

  it('writes the new level to every brick in every tower', () => {
    const towerA = makeNestedTower('a');
    const towerB = makeEmptyExpression('b', 2);

    act(() => {
      const store = useWorkspaceStore.getState();
      store.createTower({ id: 'tower-a', root: towerA, position: { x: 0, y: 0 } });
      store.createTower({ id: 'tower-b', root: towerB, position: { x: 400, y: 0 } });
    });

    renderHook(() => useWorkspaceScale());

    act(() => {
      useWorkspaceScaleStore.getState().setLevel(3);
    });

    const models = [towerA, towerB].flatMap((root) => listNodes(root)).map((node) => node.model);
    for (const model of models) {
      expect(model.scaleLevel).toBe(3);
    }

    // Named explicitly, so the sweep is shown to reach past the roots into an argument slot and a
    // nesting cavity rather than just covering whatever `listNodes` happened to return.
    expect(models.map((model) => model.id).sort()).toEqual(['a', 'a-arg', 'a-nested', 'b']);
  });

  it('re-runs the layout by replacing each tower root, leaving the tower anchored', () => {
    act(() => {
      useWorkspaceStore.getState().createTower({
        id: 'tower-a',
        root: makeNestedTower('a'),
        position: { x: 250, y: 175 },
      });
    });

    renderHook(() => useWorkspaceScale());

    const before = useWorkspaceStore.getState().towers['tower-a'];

    act(() => {
      useWorkspaceScaleStore.getState().setLevel(1);
    });

    const after = useWorkspaceStore.getState().towers['tower-a'];

    expect(after.root).not.toBe(before.root);
    expect(after.position).toBe(before.position);
    expect(after.position).toEqual({ x: 250, y: 175 });
  });

  it('leaves the bricks alone when the level does not actually change', () => {
    const root = makeNestedTower('a');

    act(() => {
      useWorkspaceStore.getState().createTower({
        id: 'tower-a',
        root,
        position: { x: 0, y: 0 },
      });
    });

    renderHook(() => useWorkspaceScale());

    const before = useWorkspaceStore.getState().towers['tower-a'].root;

    act(() => {
      // Already at the minimum, so the store clamps this away without notifying.
      useWorkspaceScaleStore.getState().setLevel(DEFAULT_SCALE_LEVEL);
      useWorkspaceScaleStore.getState().zoomOut();
      useWorkspaceScaleStore.getState().setLevel(0);
    });

    expect(useWorkspaceScaleStore.getState().level).toBe(1);
    // One re-layout for the real step down, none for the two clamped-away calls.
    expect(useWorkspaceStore.getState().towers['tower-a'].root).not.toBe(before);
    for (const node of listNodes(root)) {
      expect(node.model.scaleLevel).toBe(1);
    }
  });

  it('returns every brick in every tower to the default level on a reset', () => {
    const towerA = makeNestedTower('a');
    const towerB = makeEmptyExpression('b', 2);

    act(() => {
      const store = useWorkspaceStore.getState();
      store.createTower({ id: 'tower-a', root: towerA, position: { x: 0, y: 0 } });
      store.createTower({ id: 'tower-b', root: towerB, position: { x: 400, y: 0 } });
    });

    renderHook(() => useWorkspaceScale());

    act(() => {
      useWorkspaceScaleStore.getState().setLevel(MAX_SCALE_LEVEL);
    });

    const zoomed = {
      a: useWorkspaceStore.getState().towers['tower-a'].root,
      b: useWorkspaceStore.getState().towers['tower-b'].root,
    };

    act(() => {
      useWorkspaceScaleStore.getState().reset();
    });

    // Driven through `reset` rather than `setLevel(DEFAULT_SCALE_LEVEL)`, so the control's own path
    // is covered and not just the one it delegates to today.
    for (const model of [towerA, towerB].flatMap((root) => listNodes(root)).map((n) => n.model)) {
      expect(model.scaleLevel).toBe(DEFAULT_SCALE_LEVEL);
    }

    // A re-layout per tower, so the bricks are redrawn at the default size rather than left at the
    // zoomed geometry.
    expect(useWorkspaceStore.getState().towers['tower-a'].root).not.toBe(zoomed.a);
    expect(useWorkspaceStore.getState().towers['tower-b'].root).not.toBe(zoomed.b);
  });

  it('leaves the bricks alone when a reset lands at the default level', () => {
    const root = makeNestedTower('a');

    act(() => {
      useWorkspaceStore.getState().createTower({
        id: 'tower-a',
        root,
        position: { x: 0, y: 0 },
      });
    });

    renderHook(() => useWorkspaceScale());

    const before = useWorkspaceStore.getState().towers['tower-a'].root;

    act(() => {
      useWorkspaceScaleStore.getState().reset();
    });

    // Unreachable from the UI now the reset hides at the default, so this pins the outcome the
    // store and the selector both guard: a redundant reset costs no tower a re-layout.
    expect(useWorkspaceStore.getState().towers['tower-a'].root).toBe(before);
  });

  it('stops applying the level once unmounted', () => {
    const root = makeNestedTower('a');

    act(() => {
      useWorkspaceStore.getState().createTower({
        id: 'tower-a',
        root,
        position: { x: 0, y: 0 },
      });
    });

    const { unmount } = renderHook(() => useWorkspaceScale());
    unmount();

    act(() => {
      useWorkspaceScaleStore.getState().setLevel(3);
    });

    for (const node of listNodes(root)) {
      expect(node.model.scaleLevel).toBe(DEFAULT_SCALE_LEVEL);
    }
  });
});
