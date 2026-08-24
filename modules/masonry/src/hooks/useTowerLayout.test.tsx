// Tests for what a fold does to a tower's layout. The file is .tsx so it runs in the dom project:
// the pass yields to the browser between batches and only settles over several ticks. No brick is
// rendered here, so every widget measures zero and the dims come from the outline generator's
// minimums — enough for the positions to be read against each other.

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useMemo } from 'react';

import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';

import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';

import { useTowerLayout } from './useTowerLayout';

// -------------------------------------------------------------------------------------------------

const ORIGIN: Point = { x: 200, y: 150 };

/** Runs the layout for every tower in the workspace, the way the canvas does. */
function LayoutHarness() {
  const towersRecord = useWorkspaceStore((state) => state.towers);
  const towers = useMemo(() => Object.values(towersRecord), [towersRecord]);

  return (
    <>
      {towers.map((tower) => (
        <TowerLayout key={tower.id} root={tower.root} origin={tower.position} />
      ))}
    </>
  );
}

function TowerLayout({ root, origin }: { root: TowerNode; origin: Point }) {
  useTowerLayout(root, origin);
  return null;
}

/** A nesting brick holding a two-brick chain, with a brick following it. */
function makeFoldableTower() {
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

  return { outer, inner, innerNext, tail };
}

/** Lets the layout pass run to completion: one tick per batch, plus room to spare. */
async function settle() {
  await act(async () => {
    for (let i = 0; i < 8; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });
}

/** Mounts the harness on a tower holding `root` and waits for its first layout. */
async function layOut(root: TowerNode) {
  render(<LayoutHarness />);

  act(() => {
    useWorkspaceStore.getState().createTower({ id: 'tower-f', root, position: ORIGIN });
  });

  await settle();
}

/** The position the layout store holds for `id`. */
function coordsOf(id: string): Point {
  return useBrickLayoutStore.getState().coords[id];
}

/** How tall the tower reaches, measured from its origin down to the bottom of `tail`. */
function towerHeight(tail: TowerNode): number {
  return coordsOf(tail.model.id).y + tail.model.dims.h - ORIGIN.y;
}

/** Folds or unfolds `brickId` and waits for the re-layout it triggers. */
async function setFold(brickId: string, isFolded: boolean) {
  act(() => {
    useWorkspaceStore.getState().setNestingFold(brickId, isFolded);
  });

  await settle();
}

afterEach(() => {
  cleanup();
  useWorkspaceStore.setState({ towers: {} });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
});

// -------------------------------------------------------------------------------------------------

describe('useTowerLayout with a folded cavity', () => {
  it('leaves the cavity dims collapsed while the brick is folded', async () => {
    const { outer } = makeFoldableTower();
    await layOut(outer);

    const open = outer.model.nestingDims;
    expect(open?.h).toBeGreaterThan(0);

    await setFold('outer', true);

    // The chain is off the pass entirely, so summing it would size a cavity that is neither
    // measured nor drawn.
    expect(outer.model.nestingDims).toBeNull();
    expect(outer.model.bounds.nesting).toBeUndefined();

    await setFold('outer', false);

    expect(outer.model.nestingDims).toEqual(open);
  });

  it('moves the bricks below up by the height the fold reclaims, keeping the tower anchored', async () => {
    const { outer } = makeFoldableTower();
    await layOut(outer);

    const openOuterH = outer.model.dims.h;
    const openTailY = coordsOf('tail').y;

    await setFold('outer', true);

    const reclaimed = openOuterH - outer.model.dims.h;

    // The tower's origin is untouched by a fold, so the brick that folds stays put and everything
    // under it rides up by what the cavity held.
    expect(reclaimed).toBeGreaterThan(0);
    expect(coordsOf('outer')).toEqual(ORIGIN);
    expect(coordsOf('tail').y).toBeCloseTo(openTailY - reclaimed, 6);
    expect(coordsOf('tail').y).toBeCloseTo(ORIGIN.y + outer.model.dims.h, 6);
  });

  it('shortens the tower by what the cavity held, at every fold state', async () => {
    const { outer, inner, innerNext, tail } = makeFoldableTower();
    await layOut(outer);

    const open = towerHeight(tail);
    const cavityH = inner.model.dims.h + innerNext.model.dims.h;

    await setFold('outer', true);
    const folded = towerHeight(tail);

    // What the fold gives back is the chain's own height plus the cavity walls the brick no longer
    // draws, so the tower is at least the chain shorter.
    expect(open - folded).toBeGreaterThanOrEqual(cavityH);
    expect(folded).toBeLessThan(open);

    await setFold('outer', false);

    expect(towerHeight(tail)).toBeCloseTo(open, 6);
  });

  it('leaves the hidden chain where it stood, then places it again on unfolding', async () => {
    const { outer, inner, innerNext } = makeFoldableTower();
    await layOut(outer);

    const openInner = coordsOf('inner');
    const openInnerNext = coordsOf('inner-next');

    await setFold('outer', true);

    // A folded brick reports no cavity bounds, so positioning the chain off them would pile it
    // onto the brick itself — and it is still on the canvas' books.
    expect(coordsOf('inner')).toEqual(openInner);
    expect(coordsOf('inner-next')).toEqual(openInnerNext);

    await setFold('outer', false);

    expect(useBrickLayoutStore.getState().positioned['inner']).toBe(true);
    expect(coordsOf('inner')).toEqual(openInner);
    expect(inner.model.position).toEqual(openInner);
    expect(innerNext.model.position).toEqual(openInnerNext);
  });

  it('restores the whole layout on a fold and unfold round trip', async () => {
    const { outer, inner, innerNext, tail } = makeFoldableTower();
    await layOut(outer);

    const ids = ['outer', 'inner', 'inner-next', 'tail'];
    const before = ids.map(coordsOf);
    const dimsBefore = [outer, inner, innerNext, tail].map((node) => ({ ...node.model.dims }));

    await setFold('outer', true);
    await setFold('outer', false);

    expect(ids.map(coordsOf)).toEqual(before);
    expect([outer, inner, innerNext, tail].map((node) => ({ ...node.model.dims }))).toEqual(
      dimsBefore,
    );
  });

  it('folds one level at a time', async () => {
    const { outer, inner, innerNext, tail } = makeFoldableTower();
    // `inner` carries the cavity here, so a fold can sit inside another one.
    const nesting = makeEmptyStatement('nesting', 0, true);
    outer.nestedNext = nesting;
    nesting.prev = outer;
    nesting.nestedNext = inner;
    inner.prev = nesting;
    inner.next = innerNext;

    await layOut(outer);
    const open = towerHeight(tail);

    await setFold('nesting', true);
    const innerFolded = towerHeight(tail);

    // The outer cavity is still open, so it collapses around the shorter chain rather than shutting.
    expect(innerFolded).toBeLessThan(open);
    expect(outer.model.nestingDims).not.toBeNull();

    await setFold('outer', true);

    expect(towerHeight(tail)).toBeLessThan(innerFolded);
    expect(outer.model.nestingDims).toBeNull();

    await setFold('outer', false);

    // `nesting` was folded before the round trip and is still folded after it.
    expect(nesting.model.isNestingFolded).toBe(true);
    expect(towerHeight(tail)).toBeCloseTo(innerFolded, 6);
  });
});
