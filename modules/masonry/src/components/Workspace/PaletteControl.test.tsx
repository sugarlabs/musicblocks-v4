import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PaletteControl } from './PaletteControl';

afterEach(cleanup);

describe('PaletteControl', () => {
  it('offers to collapse an open palette', () => {
    render(<PaletteControl controls="palette" collapsed={false} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: 'Collapse palette' });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('palette');
  });

  it('offers to expand a collapsed palette', () => {
    render(<PaletteControl controls="palette" collapsed onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: 'Expand palette' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<PaletteControl controls="palette" collapsed={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse palette' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
