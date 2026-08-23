// Component test for BrickViewFixed. Unlike the pure-math path2 specs, this
// renders the React component into a DOM (jsdom) via React Testing Library and
// asserts on the produced markup.
//
// Scope note: jsdom does no real layout (getBoundingClientRect() returns zeros,
// SVG geometry is not computed), so this file covers what the component sets
// *declaratively* — the param label's color and font size — plus the outline it
// generates itself, which comes off the generator's minimums and so needs no
// measurement. The "param sits at the arg notch" positioning is geometry and is
// covered by path2.spec.ts (generateBounds), which needs no DOM.

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Size } from '@/@types/common.types';

import { ExpressionBrickModel, StatementBrickModel } from '@/models/brick';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

import { BrickViewFixed } from './BrickFixed';

afterEach(cleanup);

const colorsDefault = {
  background: '#4f46e5',
  foreground: '#ffffff',
  border: '#4338ca',
};

/** Renders an expression brick with one labelled param ("A") via a model. */
function renderExpressionBrick(scaleLevel: 1 | 2 | 3 = 2) {
  const model = new ExpressionBrickModel({
    colorsDefault,
    tooltipText: '',
    widget: { type: 'label', text: 'Add' },
    params: ['A'],
    argDims: [{ w: 40, h: 20 }],
  });
  model.scaleLevel = scaleLevel;

  return render(<BrickViewFixed kind="expression" model={model} />);
}

/**
 * Renders a statement brick whose cavity has already been measured at `nesting`, or which has no
 * cavity at all when that is null, and hands back the model so a test can fold it.
 *
 * Left at the default scale level, where `brickScale` is 1, so the rendered `svg` sizes are the
 * model's pixel dimensions unchanged.
 */
function renderStatementBrick(nesting: Size | null) {
  const model = new StatementBrickModel({
    colorsDefault,
    tooltipText: '',
    widget: { type: 'label', text: 'repeat' },
    hasNesting: nesting !== null,
    nestingDims: nesting,
    hasConnectionPrev: true,
    hasConnectionNext: true,
  });

  const { container } = render(<BrickViewFixed kind="statement" model={model} />);
  return { model, container };
}

/** The height of the rendered outline, which the component sizes to the generated path. */
function outlineHeight(container: HTMLElement): number {
  return Number(container.querySelector('svg')!.getAttribute('height'));
}

/** The generated outline path. */
function outlinePath(container: HTMLElement): string {
  return container.querySelector('path')!.getAttribute('d')!;
}

describe('BrickViewFixed param label', () => {
  it('uses the same color as the main label', async () => {
    renderExpressionBrick();

    const label = screen.getByText('Add');
    const param = await screen.findByText('A');

    // Compare the rendered values directly: jsdom normalises both the same way
    // (e.g. "#ffffff" -> "rgb(255, 255, 255)"), so equality is robust.
    expect(param.style.color).toBe(label.style.color);
  });

  it('renders smaller than the main label (0.8x the label font size)', async () => {
    const scaleLevel = 2;
    renderExpressionBrick(scaleLevel);

    const { fontSize } = SCALE_LEVEL_CONFIG[scaleLevel];
    const expectedParamFontSize = Math.round(fontSize * 0.8);

    const label = screen.getByText('Add');
    const param = await screen.findByText('A');

    expect(label.style.fontSize).toBe(`${fontSize}px`);
    expect(param.style.fontSize).toBe(`${expectedParamFontSize}px`);
    expect(expectedParamFontSize).toBeLessThan(fontSize);
  });

  it('scales the param font with the brick scale level', async () => {
    const scaleLevel = 3;
    renderExpressionBrick(scaleLevel);

    const { fontSize } = SCALE_LEVEL_CONFIG[scaleLevel];
    const param = await screen.findByText('A');

    expect(param.style.fontSize).toBe(`${Math.round(fontSize * 0.8)}px`);
  });
});

describe('BrickViewFixed nesting fold', () => {
  const CAVITY_HEIGHT = 200;

  it('redraws the brick shorter when the flag is set on a mounted model', () => {
    const { model, container } = renderStatementBrick({ w: 120, h: CAVITY_HEIGHT });
    const expanded = outlineHeight(container);

    act(() => {
      model.isNestingFolded = true;
    });

    // The component re-renders off the model's update callbacks alone, so a flag that did not
    // notify would leave the brick drawn at its expanded height.
    expect(outlineHeight(container)).toBeLessThan(expanded);
  });

  it('flattens into a plain statement rather than keeping a collapsed cavity', () => {
    const folded = renderStatementBrick({ w: 120, h: CAVITY_HEIGHT });
    act(() => {
      folded.model.isNestingFolded = true;
    });

    const plain = renderStatementBrick(null);

    // Withholding the cavity dims while folded drops the C shape, its tail and its roof notch, so
    // a folded brick draws exactly what a statement with no cavity draws. Same input the model
    // builds, so this also pins the view and the model to the same folded geometry.
    expect(outlineHeight(folded.container)).toBe(outlineHeight(plain.container));
    expect(outlinePath(folded.container)).toBe(outlinePath(plain.container));
  });

  it('restores the outline unchanged on unfolding', () => {
    const { model, container } = renderStatementBrick({ w: 120, h: CAVITY_HEIGHT });
    const expanded = { height: outlineHeight(container), path: outlinePath(container) };

    act(() => {
      model.isNestingFolded = true;
    });
    act(() => {
      model.isNestingFolded = false;
    });

    expect(outlineHeight(container)).toBeCloseTo(expanded.height, 6);
    expect(outlinePath(container)).toBe(expanded.path);
  });
});
