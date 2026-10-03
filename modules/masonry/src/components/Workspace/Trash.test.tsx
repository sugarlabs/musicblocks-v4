import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { Trash } from './Trash';
import { useTrashStore } from '@/stores/trash';

describe('Trash', () => {
  const canvasRef = { current: document.createElement('div') };

  beforeEach(() => {
    useTrashStore.setState({ bounds: null, isHovered: false, isAcknowledging: false });
  });

  it('has an accessible name', () => {
    render(<Trash canvasRef={canvasRef} />);
    expect(screen.getByRole('button', { name: 'Trash' })).toBeTruthy();
  });

  it('is not hidden from assistive technology', () => {
    render(<Trash canvasRef={canvasRef} />);
    const el = screen.getByTestId('workspace-trash');
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });

  it('preserves pointer-events-none', () => {
    render(<Trash canvasRef={canvasRef} />);
    const el = screen.getByTestId('workspace-trash');
    expect(el.className).toContain('pointer-events-none');
  });

  it('has a live region that announces hover state', () => {
    render(<Trash canvasRef={canvasRef} />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion.textContent).toBe('');

    act(() => {
      useTrashStore.setState({ isHovered: true });
    });
    expect(liveRegion.textContent).toBe('Release to delete');

    act(() => {
      useTrashStore.setState({ isHovered: false });
    });
    expect(liveRegion.textContent).toBe('');
  });
});
