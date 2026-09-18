// Unit tests for the action menu store slice. Store-only logic, no DOM, so this runs in the node
// environment. What opens and closes the menu is covered where those live; only the lifecycle of
// the one ID, and the no-op guards that keep the repeated `close` calls free, are covered here.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { useActionMenuStore } from './actionMenu';

// -------------------------------------------------------------------------------------------------

afterEach(() => {
    useActionMenuStore.setState({ brickId: null });
});

// -------------------------------------------------------------------------------------------------

describe('useActionMenuStore', () => {
    it('starts closed', () => {
        expect(useActionMenuStore.getState().brickId).toBeNull();
    });

    it('open records the brick the menu is on', () => {
        useActionMenuStore.getState().open('brick-1');

        expect(useActionMenuStore.getState().brickId).toBe('brick-1');
    });

    it('opening on another brick replaces the first, so only one carries the menu', () => {
        useActionMenuStore.getState().open('brick-1');
        useActionMenuStore.getState().open('brick-2');

        expect(useActionMenuStore.getState().brickId).toBe('brick-2');
    });

    it('close drops the brick', () => {
        useActionMenuStore.getState().open('brick-1');
        useActionMenuStore.getState().close();

        expect(useActionMenuStore.getState().brickId).toBeNull();
    });

    it('reopens after a close', () => {
        useActionMenuStore.getState().open('brick-1');
        useActionMenuStore.getState().close();
        useActionMenuStore.getState().open('brick-1');

        expect(useActionMenuStore.getState().brickId).toBe('brick-1');
    });

    it('close on an already-closed store is a no-op', () => {
        const listener = vi.fn();
        const unsubscribe = useActionMenuStore.subscribe(listener);

        // Escape, an outside press, a drag start and the target check all close unconditionally,
        // and most of those fire with nothing open.
        useActionMenuStore.getState().close();

        expect(listener).not.toHaveBeenCalled();
        expect(useActionMenuStore.getState().brickId).toBeNull();

        unsubscribe();
    });

    it('reopening on the same brick notifies nobody', () => {
        useActionMenuStore.getState().open('brick-1');

        const listener = vi.fn();
        const unsubscribe = useActionMenuStore.subscribe(listener);

        // A second right click on the brick already carrying the menu leaves it where it is.
        useActionMenuStore.getState().open('brick-1');

        expect(listener).not.toHaveBeenCalled();
        expect(useActionMenuStore.getState().brickId).toBe('brick-1');

        unsubscribe();
    });
});
