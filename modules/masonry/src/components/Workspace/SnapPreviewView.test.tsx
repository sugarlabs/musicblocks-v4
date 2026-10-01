import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SnapPreviewView } from './SnapPreviewView';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useWorkspaceScaleStore } from '@/stores/scale';

type MockBrickViewProps = {
  model: {
    scaleLevel: number;
  };
};

const { mockBrickView } = vi.hoisted(() => ({
  mockBrickView: vi.fn((_props: MockBrickViewProps) => null),
}));

vi.mock('@/components/Brick/Brick', () => ({
  BrickView: mockBrickView,
}));

describe('SnapPreviewView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useConnectionPreviewStore.setState({
      activeTarget: null,
      isValid: false,
      snapPosition: null,
      disconnectShadow: null,
    });
    useWorkspaceScaleStore.setState({
      level: 2,
    });
  });

  it('renders nothing when there is no snap position', () => {
    const { container } = render(<SnapPreviewView />);

    expect(container.firstChild).toBeNull();
  });

  it('renders a preview with the default workspace scale', () => {
    useConnectionPreviewStore.setState({
      snapPosition: { x: 100, y: 100 },
      activeTarget: {
        draggedTowerId: 'dragged-tower',
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

    const previewProps = mockBrickView.mock.calls.at(-1)![0];

    expect(previewProps.model.scaleLevel).toBe(2);
  });

  it('uses the workspace scaleLevel for a statement preview', () => {
    useWorkspaceScaleStore.setState({
      level: 3,
    });

    useConnectionPreviewStore.setState({
      snapPosition: { x: 50, y: 50 },
      activeTarget: {
        draggedTowerId: 'dragged-tower',
        targetTowerId: 'tower-host',
        targetBrickId: 'brick1',
        type: 'statement',
        distance: 5,
        centroid: { x: 50, y: 50 },
      },
      isValid: true,
    });

    render(<SnapPreviewView />);

    expect(mockBrickView).toHaveBeenCalled();

    const previewProps = mockBrickView.mock.calls.at(-1)![0];
    expect(previewProps.model.scaleLevel).toBe(3);
  });

  it('uses the workspace scaleLevel for a value preview', () => {
    useWorkspaceScaleStore.setState({
      level: 1,
    });

    useConnectionPreviewStore.setState({
      snapPosition: { x: 50, y: 50 },
      activeTarget: {
        draggedTowerId: 'dragged-tower',
        targetTowerId: 'tower-host',
        targetBrickId: 'brick1',
        type: 'argument',
        distance: 5,
        centroid: { x: 50, y: 50 },
      },
      isValid: true,
    });

    render(<SnapPreviewView />);

    expect(mockBrickView).toHaveBeenCalled();

    const previewProps = mockBrickView.mock.calls.at(-1)![0];

    expect(previewProps.model.scaleLevel).toBe(1);
  });
});
