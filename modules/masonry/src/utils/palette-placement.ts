import type { Point, Size } from '@/@types/common.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { TowerState } from '@/@types/workspace.types';

import { createBrickModel, wrapAsRootNode } from './brick-model-factory';

const MARGIN = 16;
const GRID_STEP = 32;
const GAP = 8;
const FALLBACK_SIZE: Size = { w: 120, h: 48 };

function sizeOrFallback(size: Size): Size {
  return {
    w: size.w > 0 ? size.w : FALLBACK_SIZE.w,
    h: size.h > 0 ? size.h : FALLBACK_SIZE.h,
  };
}

function overlaps(first: { position: Point; size: Size }, second: { position: Point; size: Size }) {
  return (
    first.position.x < second.position.x + second.size.w + GAP &&
    first.position.x + first.size.w + GAP > second.position.x &&
    first.position.y < second.position.y + second.size.h + GAP &&
    first.position.y + first.size.h + GAP > second.position.y
  );
}

export function findKeyboardPlacement(towers: Record<string, TowerState>, size: Size): Point {
  const candidateSize = sizeOrFallback(size);
  const occupied = Object.values(towers).map((tower) => ({
    position: tower.position,
    size: sizeOrFallback(tower.root.model.dims),
  }));

  for (let row = 0; ; row++) {
    for (let column = 0; column < 100; column++) {
      const position = {
        x: MARGIN + column * GRID_STEP,
        y: MARGIN + row * GRID_STEP,
      };
      const candidate = { position, size: candidateSize };

      if (!occupied.some((item) => overlaps(candidate, item))) return position;
    }
  }
}

export function createPaletteTower(
  brick: PaletteBrickConfig,
  position: Point,
  scaleLevel?: 1 | 2 | 3,
): TowerState {
  const model = createBrickModel({ ...brick.brick, scaleLevel });

  return {
    id: crypto.randomUUID(),
    root: wrapAsRootNode(model),
    position,
  };
}