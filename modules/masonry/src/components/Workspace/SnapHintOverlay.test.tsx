import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SnapHintOverlay } from './SnapHintOverlay';
import { useConnectionPreviewStore } from '@/stores/connection-preview';

describe('SnapHintOverlay', () => {
  beforeEach(() => {
    useConnectionPreviewStore.setState({
      activeTarget: null,
      isValid: false,
      snapPosition: null,
      disconnectShadow: null,
    });
  });

  it('renders nothing when there is no active target', () => {
    const { container } = render(<SnapHintOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders valid hint overlay with correct position and color', () => {
    useConnectionPreviewStore.setState({
      activeTarget: {
        draggedTowerId: 'tower1',
        targetTowerId: 'tower2',
        targetBrickId: 'brick1',
        type: 'statement',
        distance: 5,
        centroid: { x: 100, y: 150 },
      },
      isValid: true,
    });

    const { getByTestId } = render(<SnapHintOverlay />);
    const overlay = getByTestId('snap-hint-overlay');

    expect(overlay).toBeTruthy();
    expect(overlay.style.left).toBe('100px');
    expect(overlay.style.top).toBe('150px');
    expect(overlay.style.transform).toContain('scale(1.2)');
    // Valid color falls back to rgba(34, 197, 94, 0.4) because towers store is empty in this test
    expect(overlay.style.backgroundColor).toBe('rgba(34, 197, 94, 0.4)');
  });

  it('renders invalid hint overlay with correct color', () => {
    useConnectionPreviewStore.setState({
      activeTarget: {
        draggedTowerId: 'tower1',
        targetTowerId: 'tower2',
        targetBrickId: 'brick1',
        type: 'argument',
        distance: 5,
        centroid: { x: 200, y: 250 },
      },
      isValid: false,
    });

    const { getByTestId } = render(<SnapHintOverlay />);
    const overlay = getByTestId('snap-hint-overlay');

    expect(overlay).toBeTruthy();
    expect(overlay.style.transform).toContain('scale(1)');
    expect(overlay.style.backgroundColor).toBe('rgba(239, 68, 68, 0.4)');
  });
});
