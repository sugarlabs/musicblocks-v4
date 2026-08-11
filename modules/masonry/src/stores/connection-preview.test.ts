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
