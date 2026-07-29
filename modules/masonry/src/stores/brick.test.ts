// Unit tests for the Brick layout store's removal action. Store-only logic — no DOM — so this runs
// in the node environment. The three `set*` merges are exercised only as far as seeding the state
// `clearBricks` has to undo.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { useBrickLayoutStore } from './brick';

// -------------------------------------------------------------------------------------------------

/** Gives every id an entry in all three records, as a completed layout pass would. */
function seed(ids: string[]) {
    const store = useBrickLayoutStore.getState();

    store.setCoords(Object.fromEntries(ids.map((id, index) => [id, { x: index, y: index }])));
    store.setMounted(Object.fromEntries(ids.map((id) => [id, true])));
    store.setPositioned(Object.fromEntries(ids.map((id) => [id, true])));
}

/** Which of the three records still hold an entry for `id`. */
function recordsHolding(id: string): string[] {
    const { coords, mounted, positioned } = useBrickLayoutStore.getState();

    return [
        ...(id in coords ? ['coords'] : []),
        ...(id in mounted ? ['mounted'] : []),
        ...(id in positioned ? ['positioned'] : []),
    ];
}

afterEach(() => {
    useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
});

// -------------------------------------------------------------------------------------------------

describe('useBrickLayoutStore.clearBricks', () => {
    it('drops all three entries of the bricks it is given', () => {
        seed(['brick-a', 'brick-b']);

        useBrickLayoutStore.getState().clearBricks(['brick-a', 'brick-b']);

        expect(recordsHolding('brick-a')).toEqual([]);
        expect(recordsHolding('brick-b')).toEqual([]);
    });

    it('leaves the bricks it was not given untouched', () => {
        seed(['removed', 'kept']);

        useBrickLayoutStore.getState().clearBricks(['removed']);

        const { coords, mounted, positioned } = useBrickLayoutStore.getState();
        expect(recordsHolding('kept')).toEqual(['coords', 'mounted', 'positioned']);
        expect(coords['kept']).toEqual({ x: 1, y: 1 });
        expect(mounted['kept']).toBe(true);
        expect(positioned['kept']).toBe(true);
    });

    it('clears a brick that only one of the records holds', () => {
        // A brick removed mid-layout has coords but was never mounted or positioned.
        useBrickLayoutStore.getState().setCoords('half-laid-out', { x: 4, y: 5 });

        useBrickLayoutStore.getState().clearBricks(['half-laid-out']);

        expect(recordsHolding('half-laid-out')).toEqual([]);
    });

    it('ignores ids the store never held', () => {
        seed(['kept']);

        useBrickLayoutStore.getState().clearBricks(['never-existed']);

        expect(recordsHolding('kept')).toEqual(['coords', 'mounted', 'positioned']);
    });

    it('drops the three records in a single notification', () => {
        seed(['brick-a']);
        const listener = vi.fn();
        const unsubscribe = useBrickLayoutStore.subscribe(listener);

        useBrickLayoutStore.getState().clearBricks(['brick-a']);

        // Three separate writes would let a consumer observe a brick present in one record and
        // absent from another.
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    it('notifies no subscriber when none of the ids were tracked', () => {
        seed(['kept']);
        const listener = vi.fn();
        const unsubscribe = useBrickLayoutStore.subscribe(listener);

        // `Workspace` reads any `positioned` change as a settled layout and re-syncs every tower's
        // connectors from it, so a clear with nothing to do must not produce a new state object.
        useBrickLayoutStore.getState().clearBricks(['never-existed']);
        useBrickLayoutStore.getState().clearBricks([]);

        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
    });

    it('is idempotent: clearing the same bricks twice notifies only once', () => {
        seed(['brick-a']);
        const listener = vi.fn();
        const unsubscribe = useBrickLayoutStore.subscribe(listener);

        useBrickLayoutStore.getState().clearBricks(['brick-a']);
        useBrickLayoutStore.getState().clearBricks(['brick-a']);

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    it('drops the tracked ids of a mixed batch and tolerates the rest', () => {
        seed(['brick-a']);

        useBrickLayoutStore.getState().clearBricks(['never-existed', 'brick-a']);

        expect(recordsHolding('brick-a')).toEqual([]);
    });
});
