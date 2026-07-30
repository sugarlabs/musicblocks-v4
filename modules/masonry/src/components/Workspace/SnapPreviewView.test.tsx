import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SnapPreviewView } from './SnapPreviewView';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useWorkspaceStore } from '@/stores/workspace';

describe('SnapPreviewView', () => {
  beforeEach(() => {
    useConnectionPreviewStore.setState({
      activeTarget: null,
      isValid: false,
      snapPosition: null,
      disconnectShadow: null,
    });
    useWorkspaceStore.setState({ towers: {} });
  });

  it('renders nothing when there is no snap position', () => {
    const { container } = render(<SnapPreviewView />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a dummy ghost block even if the dragged tower is not in the store', () => {
    useConnectionPreviewStore.setState({
      snapPosition: { x: 100, y: 100 },
      activeTarget: {
        draggedTowerId: 'missing-tower',
        targetTowerId: 'tower2',
        targetBrickId: 'brick1',
        type: 'statement',
        distance: 5,
        centroid: { x: 100, y: 150 },
      },
      isValid: true,
    });
    const { getByTestId } = render(<SnapPreviewView />);
    const container = getByTestId('snap-preview-view');
    expect(container).toBeTruthy();
    expect(container.style.transform).toBe('translate(100px, 100px)');
  });
});
