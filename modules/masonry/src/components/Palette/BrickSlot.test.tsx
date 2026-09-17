// Component test for BrickSlot's preview scale. Verifies the preview reads the active workspace
// zoom level rather than the entry's own (normally unset) scaleLevel, rebuilds on a zoom change,
// and keeps its slot sizing sane at the lowest and highest zoom levels.

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { BrickViewProps } from '@/@types/brick.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';

import { DEFAULT_SCALE_LEVEL, MAX_SCALE_LEVEL, MIN_SCALE_LEVEL } from '@/utils/constants';
import { usePaletteDragStore } from '@/stores/palette';
import { useWorkspaceScaleStore } from '@/stores/scale';

import { BrickSlot } from './BrickSlot';

afterEach(() => {
  cleanup();
  useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });
  usePaletteDragStore.setState({ dragged: null });
});

// -------------------------------------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------------------------------------

const brickProps = (name: string): BrickViewProps => ({
  kind: 'statement',
  widget: { type: 'label', text: name },
  colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
  tooltipText: name,
});

const entry = (id: string, name: string): PaletteBrickConfig => ({
  id,
  name,
  description: name,
  brick: brickProps(name),
});

// A compound entry (e.g. "repeat", "if") — palette configs preview these with an open, unfolded
// cavity (mocks/palette.ts), which is the tallest shape a preview can take.
const nestedEntry = (id: string, name: string): PaletteBrickConfig => ({
  id,
  name,
  description: name,
  brick: {
    kind: 'statement',
    widget: { type: 'label', text: name },
    colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
    tooltipText: name,
    nesting: { dims: null, isFolded: false },
  },
});

describe('BrickSlot', () => {
  it("renders the brick at the workspace's default zoom level", () => {
    render(<BrickSlot brick={entry('b1', 'Note')} />);

    const svg = screen.getByText('Note').closest('svg');
    expect(svg).toBeTruthy();
  });

  it('rebuilds the preview when the workspace zoom level changes', () => {
    render(<BrickSlot brick={entry('b1', 'Note')} />);

    const heightAtDefault = screen.getByText('Note').closest('svg')?.getAttribute('height');

    act(() => {
      useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    });

    const heightAtMax = screen.getByText('Note').closest('svg')?.getAttribute('height');

    // A different zoom level scales the brick, so the rendered SVG's height must change too —
    // a stale memo would leave it pinned to the default-level size.
    expect(heightAtMax).not.toBe(heightAtDefault);
  });

  it('renders at the lowest zoom level without collapsing the slot below its floor', () => {
    useWorkspaceScaleStore.setState({ level: MIN_SCALE_LEVEL });
    render(<BrickSlot brick={entry('b1', 'Note')} />);

    const slot = screen.getByText('Note').closest('[data-brick-id]');
    expect(slot?.className.includes('min-h-11')).toBe(true);
  });

  it('renders a compound (nested) preview at the highest zoom level without shrinking the slot floor', () => {
    useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    render(<BrickSlot brick={nestedEntry('b2', 'Repeat')} />);

    const slot = screen.getByText('Repeat').closest('[data-brick-id]');
    expect(slot?.className.includes('min-h-11')).toBe(true);
    // The row's height comes from its content via `grid-rows-[1fr]`, so an open cavity taller
    // than the min-h floor must still render fully rather than being clipped to it.
    const svgHeight = Number(screen.getByText('Repeat').closest('svg')?.getAttribute('height'));
    expect(svgHeight).toBeGreaterThan(44);
  });

  it('collapses the row once the entry is being dragged, independent of zoom level', () => {
    const brick = entry('b1', 'Note');
    render(<BrickSlot brick={brick} />);

    const row = () =>
      screen.getByText('Note').closest('[data-brick-id]')?.parentElement?.parentElement;
    expect(row()?.className.includes('grid-rows-[1fr]')).toBe(true);

    act(() => {
      usePaletteDragStore.getState().startDrag(brick);
    });

    expect(row()?.className.includes('grid-rows-[0fr]')).toBe(true);
  });
});
