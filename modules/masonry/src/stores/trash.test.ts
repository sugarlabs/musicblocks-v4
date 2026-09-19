// Unit tests for the Trash store slice. Store-only logic — no DOM — so this runs in the node
// environment. The rect itself is measured by the Trash component; only the lifecycle of the two
// values, and the no-op guard that keeps per-frame drag writes cheap, are covered here.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Bounds } from '@/@types/common.types';

import { ACKNOWLEDGE_TRASH_DURATION_MS, useTrashStore } from './trash';

// -------------------------------------------------------------------------------------------------

const bounds: Bounds = { x: 100, y: 200, w: 56, h: 56 };

afterEach(() => {
    useTrashStore.setState({ bounds: null, isHovered: false, isAcknowledging: false });
});

// -------------------------------------------------------------------------------------------------

describe('useTrashStore', () => {
    it('starts unmeasured and unhovered', () => {
        expect(useTrashStore.getState().bounds).toBeNull();
        expect(useTrashStore.getState().isHovered).toBe(false);
    });

    it('setBounds publishes the measured rect', () => {
        useTrashStore.getState().setBounds(bounds);

        expect(useTrashStore.getState().bounds).toEqual(bounds);
    });

    it('setBounds(null) drops the rect when the Trash leaves the canvas', () => {
        useTrashStore.getState().setBounds(bounds);
        useTrashStore.getState().setBounds(null);

        expect(useTrashStore.getState().bounds).toBeNull();
    });

    it('a re-measure replaces the previous rect rather than merging with it', () => {
        const moved: Bounds = { x: 300, y: 400, w: 56, h: 56 };

        useTrashStore.getState().setBounds(bounds);
        useTrashStore.getState().setBounds(moved);

        expect(useTrashStore.getState().bounds).toEqual(moved);
    });

    it('setHovered flips the flag in both directions', () => {
        useTrashStore.getState().setHovered(true);
        expect(useTrashStore.getState().isHovered).toBe(true);

        useTrashStore.getState().setHovered(false);
        expect(useTrashStore.getState().isHovered).toBe(false);
    });

    it('setHovered notifies subscribers only when the flag actually changes', () => {
        const listener = vi.fn();
        const unsubscribe = useTrashStore.subscribe(listener);

        // The drag hook calls this on every pointer frame, so repeats must be free.
        useTrashStore.getState().setHovered(true);
        useTrashStore.getState().setHovered(true);
        useTrashStore.getState().setHovered(true);

        expect(listener).toHaveBeenCalledTimes(1);

        useTrashStore.getState().setHovered(false);
        expect(listener).toHaveBeenCalledTimes(2);

        unsubscribe();
    });

    it('setHovered(false) on an already-cleared store is a no-op', () => {
        const listener = vi.fn();
        const unsubscribe = useTrashStore.subscribe(listener);

        // `useBrickMove`'s `end` clears unconditionally, including after a drag that never
        // crossed the Trash.
        useTrashStore.getState().setHovered(false);

        expect(listener).not.toHaveBeenCalled();
        expect(useTrashStore.getState().isHovered).toBe(false);

        unsubscribe();
    });

    it('keeps the rect and the hovered flag independent of each other', () => {
        useTrashStore.getState().setBounds(bounds);
        useTrashStore.getState().setHovered(true);

        expect(useTrashStore.getState().bounds).toEqual(bounds);

        useTrashStore.getState().setBounds(null);

        expect(useTrashStore.getState().isHovered).toBe(true);
    });

    describe('acknowledgeTrash', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('starts unacknowledged', () => {
            expect(useTrashStore.getState().isAcknowledging).toBe(false);
        });

        it('sets isAcknowledging to true and resets to false after duration', () => {
            useTrashStore.getState().acknowledgeTrash();
            expect(useTrashStore.getState().isAcknowledging).toBe(true);

            vi.advanceTimersByTime(ACKNOWLEDGE_TRASH_DURATION_MS - 1);
            expect(useTrashStore.getState().isAcknowledging).toBe(true);

            vi.advanceTimersByTime(1);
            expect(useTrashStore.getState().isAcknowledging).toBe(false);
        });

        it('resets the timeout on successive calls', () => {
            useTrashStore.getState().acknowledgeTrash();
            expect(useTrashStore.getState().isAcknowledging).toBe(true);

            vi.advanceTimersByTime(200);
            expect(useTrashStore.getState().isAcknowledging).toBe(true);

            // Trigger again — extends the pulse for full duration
            useTrashStore.getState().acknowledgeTrash();

            vi.advanceTimersByTime(200);
            expect(useTrashStore.getState().isAcknowledging).toBe(true);

            vi.advanceTimersByTime(ACKNOWLEDGE_TRASH_DURATION_MS - 200);
            expect(useTrashStore.getState().isAcknowledging).toBe(false);
        });
    });
});
