import { describe, it, expect, beforeEach } from 'vitest';
import { useConnectionPreviewStore } from './connection-preview';

describe('useConnectionPreviewStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        useConnectionPreviewStore.setState({
            activeTarget: null,
            isValid: false,
            snapPosition: null,
            disconnectShadow: null,
        });
    });

    it('should set and clear preview target', () => {
        const store = useConnectionPreviewStore.getState();
        const target = {
            draggedTowerId: 'tower1',
            targetTowerId: 'tower2',
            targetBrickId: 'brick1',
            type: 'statement' as const,
            distance: 10,
            centroid: { x: 50, y: 50 },
        };
        const snapPos = { x: 100, y: 100 };

        store.setPreviewTarget(target, true, snapPos);

        let state = useConnectionPreviewStore.getState();
        expect(state.activeTarget).toEqual(target);
        expect(state.isValid).toBe(true);
        expect(state.snapPosition).toEqual(snapPos);

        state.clearPreviewTarget();
        state = useConnectionPreviewStore.getState();
        expect(state.activeTarget).toBeNull();
        expect(state.isValid).toBe(false);
        expect(state.snapPosition).toBeNull();
    });

    it('should not update state if preview target is identical', () => {
        const target = {
            draggedTowerId: 'tower1',
            targetTowerId: 'tower2',
            targetBrickId: 'brick1',
            type: 'statement' as const,
            distance: 10,
            centroid: { x: 50, y: 50 },
        };
        const snapPos = { x: 100, y: 100 };

        useConnectionPreviewStore.getState().setPreviewTarget(target, true, snapPos);
        const state1 = useConnectionPreviewStore.getState();

        // Set again with identical data
        useConnectionPreviewStore.getState().setPreviewTarget(
            { ...target }, // new object reference
            true,
            { ...snapPos }, // new object reference
        );
        const state2 = useConnectionPreviewStore.getState();

        // The state object reference should be exactly the same
        expect(state1).toBe(state2);
    });

    it('should update state when candidate connection type changes on same target brick', () => {
        const baseTarget = {
            draggedTowerId: 'tower1',
            targetTowerId: 'tower2',
            targetBrickId: 'brick1',
            type: 'statement' as const,
            distance: 10,
            centroid: { x: 50, y: 50 },
        };
        const snapPos = { x: 100, y: 100 };

        useConnectionPreviewStore.getState().setPreviewTarget(baseTarget, true, snapPos);
        const state1 = useConnectionPreviewStore.getState();

        // Switch connection type to 'argument' on the same target brick
        useConnectionPreviewStore
            .getState()
            .setPreviewTarget({ ...baseTarget, type: 'argument' }, true, snapPos);
        const state2 = useConnectionPreviewStore.getState();

        expect(state2).not.toBe(state1);
        expect(state2.activeTarget?.type).toBe('argument');
    });

    it('should update state when target centroid changes on same target brick', () => {
        const baseTarget = {
            draggedTowerId: 'tower1',
            targetTowerId: 'tower2',
            targetBrickId: 'brick1',
            type: 'argument' as const,
            distance: 10,
            centroid: { x: 50, y: 50 },
        };
        const snapPos = { x: 100, y: 100 };

        useConnectionPreviewStore.getState().setPreviewTarget(baseTarget, true, snapPos);
        const state1 = useConnectionPreviewStore.getState();

        // Switch to slot 2 with a different centroid
        useConnectionPreviewStore
            .getState()
            .setPreviewTarget({ ...baseTarget, centroid: { x: 80, y: 50 } }, true, snapPos);
        const state2 = useConnectionPreviewStore.getState();

        expect(state2).not.toBe(state1);
        expect(state2.activeTarget?.centroid).toEqual({ x: 80, y: 50 });
    });

    it('should update state when draggedTowerId changes on same target brick', () => {
        const baseTarget = {
            draggedTowerId: 'tower1',
            targetTowerId: 'tower2',
            targetBrickId: 'brick1',
            type: 'statement' as const,
            distance: 10,
            centroid: { x: 50, y: 50 },
        };
        const snapPos = { x: 100, y: 100 };

        useConnectionPreviewStore.getState().setPreviewTarget(baseTarget, true, snapPos);
        const state1 = useConnectionPreviewStore.getState();

        // Switch dragged tower to a different tower
        useConnectionPreviewStore
            .getState()
            .setPreviewTarget({ ...baseTarget, draggedTowerId: 'tower3' }, true, snapPos);
        const state2 = useConnectionPreviewStore.getState();

        expect(state2).not.toBe(state1);
        expect(state2.activeTarget?.draggedTowerId).toBe('tower3');
    });

    it('should not update state when setting null target repeatedly', () => {
        const store = useConnectionPreviewStore.getState();
        store.setPreviewTarget(null, false, null);
        const state1 = useConnectionPreviewStore.getState();

        store.setPreviewTarget(null, false, null);
        const state2 = useConnectionPreviewStore.getState();

        expect(state1).toBe(state2);
    });

    it('should set and clear disconnect shadow', () => {
        const store = useConnectionPreviewStore.getState();
        const shadow = {
            hostTowerId: 'tower1',
            hostBrickId: 'brick1',
            socket: 'next' as const,
        };

        store.setDisconnectShadow(shadow);

        let state = useConnectionPreviewStore.getState();
        expect(state.disconnectShadow).toEqual(shadow);

        state.clearDisconnectShadow();
        state = useConnectionPreviewStore.getState();
        expect(state.disconnectShadow).toBeNull();
    });
});
