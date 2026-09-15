import { describe, expect, it } from 'vitest';

import type { TowerState } from '@/@types/workspace.types';

import { createBrickModel, wrapAsRootNode } from './brick-model-factory';
import { findKeyboardPlacement } from './palette-placement';

const brick = {
  kind: 'statement' as const,
  widget: { type: 'label' as const, text: 'Note' },
  colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
  tooltipText: 'play a note',
  paramArgs: [],
};

function tower(position: { x: number; y: number }): TowerState {
  return {
    id: 'existing',
    root: wrapAsRootNode(createBrickModel(brick)),
    position,
  };
}

describe('findKeyboardPlacement', () => {
  it('uses the fixed top-left insertion position when it is free', () => {
    expect(findKeyboardPlacement({}, { w: 120, h: 48 })).toEqual({ x: 16, y: 16 });
  });

  it('moves to the next free grid position when the insertion position is occupied', () => {
    expect(findKeyboardPlacement({ existing: tower({ x: 16, y: 16 }) }, { w: 120, h: 48 })).toEqual(
      { x: 144, y: 16 },
    );
  });
});