import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { DisconnectShadowView } from './DisconnectShadowView';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useBrickLayoutStore } from '@/stores/brick';

describe('DisconnectShadowView', () => {
  beforeEach(() => {
    useConnectionPreviewStore.setState({
      activeTarget: null,
      isValid: false,
      snapPosition: null,
      disconnectShadow: null,
    });
    useBrickLayoutStore.setState({ coords: {} });
  });

  it('renders nothing when there is no disconnect shadow', () => {
    const { container } = render(<DisconnectShadowView />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when the host coordinates are not found', () => {
    useConnectionPreviewStore.setState({
      disconnectShadow: {
        hostTowerId: 'tower1',
        hostBrickId: 'missing-host',
        socket: 'next',
      },
    });
    const { container } = render(<DisconnectShadowView />);
    expect(container.firstChild).toBeNull();
  });
});
