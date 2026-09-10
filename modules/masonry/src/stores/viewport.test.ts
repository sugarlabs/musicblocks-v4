import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceViewportStore } from './viewport';

describe('useWorkspaceViewportStore', () => {
  beforeEach(() => {
    useWorkspaceViewportStore.setState({ offsetX: 0, offsetY: 0, scale: 1 });
  });

  it('should initialize with default offset values', () => {
    const state = useWorkspaceViewportStore.getState();
    expect(state.offsetX).toBe(0);
    expect(state.offsetY).toBe(0);
  });

  it('should update offsets correctly using setOffset', () => {
    const { setOffset } = useWorkspaceViewportStore.getState();
    setOffset(150, -250);

    const state = useWorkspaceViewportStore.getState();
    expect(state.offsetX).toBe(150);
    expect(state.offsetY).toBe(-250);
  });

  it('should update offsets correctly using pan', () => {
    const { pan } = useWorkspaceViewportStore.getState();
    pan(50, 50);
    pan(20, -10);

    const state = useWorkspaceViewportStore.getState();
    expect(state.offsetX).toBe(70);
    expect(state.offsetY).toBe(40);
  });
});