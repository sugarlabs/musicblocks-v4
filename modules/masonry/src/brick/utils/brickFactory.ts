// brickFactory.ts
import { SimpleBrick, ExpressionBrick } from '../model/model';
import CompoundBrick from '../model/model';
import type { TBrickType, TColor, TExtent } from '../@types/brick';

let idCounter = 0;
function generateUUID(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

// Default colors
const defaultColors = {
  simple: {
    colorBg: '#bbdefb' as TColor,
    colorFg: '#222' as TColor,
    strokeColor: '#1976d2' as TColor,
  },
  expression: {
    colorBg: '#b2fab4' as TColor,
    colorFg: '#222' as TColor,
    strokeColor: '#2e7d32' as TColor,
  },
  compound: {
    colorBg: '#b9f6ca' as TColor,
    colorFg: '#222' as TColor,
    strokeColor: '#43a047' as TColor,
  },
};

const defaultLabelType = 'text' as const;
const defaultScale = 1;
const defaultBBoxArgs: TExtent[] = [{ w: 40, h: 20 }];

export function createSimpleBrick(overrides: Partial<ConstructorParameters<typeof SimpleBrick>[0]> = {}) {
  const idx = idCounter + 1;
  // By default, SimpleBrick has two argument slots (for arguments/inputs)
  return new SimpleBrick({
    uuid: generateUUID('simple'),
    name: overrides.name ?? `Simple${idx}`,
    label: overrides.label ?? `Simple${idx}`,
    labelType: overrides.labelType ?? defaultLabelType,
    colorBg: overrides.colorBg ?? defaultColors.simple.colorBg,
    colorFg: overrides.colorFg ?? defaultColors.simple.colorFg,
    strokeColor: overrides.strokeColor ?? defaultColors.simple.strokeColor,
    shadow: overrides.shadow ?? false,
    scale: overrides.scale ?? defaultScale,
    bboxArgs: overrides.bboxArgs ?? [{ w: 40, h: 20 }, { w: 40, h: 20 }],
    topNotch: overrides.topNotch ?? true,
    bottomNotch: overrides.bottomNotch ?? true,
    tooltip: overrides.tooltip,
    ...overrides,
  });
}

// ExpressionBrick is used as an argument value, not as an argument-receiving brick
export function createExpressionBrick(overrides: Partial<ConstructorParameters<typeof ExpressionBrick>[0]> = {}) {
  const idx = idCounter + 1;
  return new ExpressionBrick({
    uuid: generateUUID('expr'),
    name: overrides.name ?? `Expr${idx}`,
    label: overrides.label ?? `Expr${idx}`,
    labelType: overrides.labelType ?? defaultLabelType,
    colorBg: overrides.colorBg ?? defaultColors.expression.colorBg,
    colorFg: overrides.colorFg ?? defaultColors.expression.colorFg,
    strokeColor: overrides.strokeColor ?? defaultColors.expression.strokeColor,
    shadow: overrides.shadow ?? false,
    scale: overrides.scale ?? defaultScale,
    bboxArgs: overrides.bboxArgs ?? [{ w: 40, h: 20 }],
    value: overrides.value,
    isValueSelectOpen: overrides.isValueSelectOpen ?? false,
    tooltip: overrides.tooltip,
    ...overrides,
  });
}

export function createCompoundBrick(overrides: Partial<ConstructorParameters<typeof CompoundBrick>[0]> = {}) {
  const idx = idCounter + 1;
  return new CompoundBrick({
    uuid: generateUUID('compound'),
    name: overrides.name ?? `Compound${idx}`,
    label: overrides.label ?? `Compound${idx}`,
    labelType: overrides.labelType ?? defaultLabelType,
    colorBg: overrides.colorBg ?? defaultColors.compound.colorBg,
    colorFg: overrides.colorFg ?? defaultColors.compound.colorFg,
    strokeColor: overrides.strokeColor ?? defaultColors.compound.strokeColor,
    shadow: overrides.shadow ?? false,
    scale: overrides.scale ?? defaultScale,
    bboxArgs: overrides.bboxArgs ?? defaultBBoxArgs,
    bboxNest: overrides.bboxNest ?? [],
    topNotch: overrides.topNotch ?? true,
    bottomNotch: overrides.bottomNotch ?? true,
    isFolded: overrides.isFolded ?? false,
    tooltip: overrides.tooltip,
    ...overrides,
  });
}

export function resetFactoryCounter() {
  idCounter = 0;
}

export function getFactoryCounter() {
  return idCounter;
}

export function createBrick(type: TBrickType, overrides: any = {}) {
  switch (type) {
    case 'Simple':
      return createSimpleBrick(overrides);
    case 'Expression':
      return createExpressionBrick(overrides);
    case 'Compound':
      return createCompoundBrick(overrides);
    default:
      throw new Error(`Unsupported brick type: ${type}`);
  }
}
