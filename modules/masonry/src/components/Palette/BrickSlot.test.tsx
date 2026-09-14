import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PaletteBrickConfig } from '@/@types/palette.types';
import { useWorkspaceScaleStore } from '@/stores/scale';

const { createBrickModelMock } = vi.hoisted(() => ({
  createBrickModelMock: vi.fn((props: { kind: string }) => ({ kind: props.kind })),
}));

vi.mock('@/utils/brick-model-factory', () => ({
  createBrickModel: createBrickModelMock,
}));

vi.mock('@/components/Brick/Brick', () => ({
  BrickView: () => <div data-testid="brick-preview" />,
}));

import { BrickSlot } from './BrickSlot';

const brick: PaletteBrickConfig = {
  id: 'preview-brick',
  name: 'Preview brick',
  description: 'Preview description',
  brick: {
    kind: 'statement',
    widget: { type: 'label', text: 'Preview' },
    colorsDefault: { background: '#000000', foreground: '#ffffff', border: '#333333' },
    tooltipText: 'Preview',
  },
};

afterEach(cleanup);

beforeEach(() => {
  createBrickModelMock.mockClear();
  useWorkspaceScaleStore.getState().reset();
});

describe('BrickSlot workspace scale', () => {
  it('rebuilds the preview model when the workspace scale changes', () => {
    act(() => useWorkspaceScaleStore.getState().setLevel(1));
    render(<BrickSlot brick={brick} />);

    expect(createBrickModelMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ scaleLevel: 1 }),
      brick.id,
    );

    act(() => useWorkspaceScaleStore.getState().setLevel(3));

    expect(createBrickModelMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ scaleLevel: 3 }),
      brick.id,
    );
    expect(createBrickModelMock).toHaveBeenCalledTimes(2);
  });

  it('keeps the slot sizing and collapse classes at scale levels 1 and 3', () => {
    act(() => useWorkspaceScaleStore.getState().setLevel(1));
    const { container } = render(<BrickSlot brick={brick} />);

    const assertSlotClasses = () => {
      const outer = container.firstElementChild;
      const slot = container.querySelector('[data-brick-id="preview-brick"]');

      expect(outer?.className).toContain('min-h-6');
      expect(outer?.className).toContain('grid-rows-[1fr]');
      expect(outer?.className).toContain('transition-all');
      expect(slot?.className).toContain('min-h-11');
    };

    assertSlotClasses();
    act(() => useWorkspaceScaleStore.getState().setLevel(3));
    assertSlotClasses();
  });
});
