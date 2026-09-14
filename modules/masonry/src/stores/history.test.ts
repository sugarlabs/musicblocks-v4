import { act } from '@testing-library/react';
import { useWorkspaceHistoryStore } from './history';
import { useWorkspaceStore } from './workspace';

describe('Workspace History Store', () => {
    beforeEach(() => {
        act(() => {
            useWorkspaceHistoryStore.getState().clear();
            useWorkspaceStore.setState({ towers: {} });
        });
    });

    it('initializes the history', () => {
        act(() => {
            useWorkspaceHistoryStore.getState().init();
        });
        const state = useWorkspaceHistoryStore.getState();
        expect(state.history.length).toBe(1);
        expect(state.currentIndex).toBe(0);
    });

    it('commits a new state and increments index', () => {
        act(() => {
            useWorkspaceHistoryStore.getState().init();
            useWorkspaceHistoryStore.getState().commit();
        });
        const state = useWorkspaceHistoryStore.getState();
        expect(state.history.length).toBe(2);
        expect(state.currentIndex).toBe(1);
    });

    it('undoes to previous state', () => {
        act(() => {
            useWorkspaceHistoryStore.getState().init();
            useWorkspaceHistoryStore.getState().commit();
            useWorkspaceHistoryStore.getState().undo();
        });
        const state = useWorkspaceHistoryStore.getState();
        expect(state.history.length).toBe(2);
        expect(state.currentIndex).toBe(0);
    });

    it('redoes to next state', () => {
        act(() => {
            useWorkspaceHistoryStore.getState().init();
            useWorkspaceHistoryStore.getState().commit();
            useWorkspaceHistoryStore.getState().undo();
            useWorkspaceHistoryStore.getState().redo();
        });
        const state = useWorkspaceHistoryStore.getState();
        expect(state.history.length).toBe(2);
        expect(state.currentIndex).toBe(1);
    });

    it('drops future states when committing after an undo', () => {
        act(() => {
            useWorkspaceHistoryStore.getState().init(); // index 0
            useWorkspaceHistoryStore.getState().commit(); // index 1
            useWorkspaceHistoryStore.getState().commit(); // index 2
            
            // Undo back to index 1
            useWorkspaceHistoryStore.getState().undo(); 
            
            // Commit a new state, this should overwrite index 2 and drop anything beyond
            useWorkspaceHistoryStore.getState().commit(); 
        });
        
        const state = useWorkspaceHistoryStore.getState();
        expect(state.history.length).toBe(3);
        expect(state.currentIndex).toBe(2);
    });

    it('clears the history completely', () => {
        act(() => {
            useWorkspaceHistoryStore.getState().init();
            useWorkspaceHistoryStore.getState().commit();
            useWorkspaceHistoryStore.getState().clear();
        });
        const state = useWorkspaceHistoryStore.getState();
        expect(state.history.length).toBe(0);
        expect(state.currentIndex).toBe(-1);
    });

    it('enforces the maxHistory limit', () => {
        const MAX_HISTORY = useWorkspaceHistoryStore.getState().maxHistory;
        
        act(() => {
            useWorkspaceHistoryStore.getState().init();
            // Commit maxHistory + 5 times
            for (let i = 0; i < MAX_HISTORY + 5; i++) {
                useWorkspaceHistoryStore.getState().commit();
            }
        });

        const state = useWorkspaceHistoryStore.getState();
        // The array should be clamped to maxHistory
        expect(state.history.length).toBe(MAX_HISTORY);
        // The index should be at the end of the array
        expect(state.currentIndex).toBe(MAX_HISTORY - 1);
    });
});
