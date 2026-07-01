// Component test for BrickViewFixed. Unlike the pure-math path2 specs, this
// renders the React component into a DOM (jsdom) via React Testing Library and
// asserts on the produced markup.
//
// Scope note: jsdom does no real layout (getBoundingClientRect() returns zeros,
// SVG geometry is not computed), so this file only covers what the component
// sets *declaratively* — the param label's color and font size. The "param sits
// at the arg notch" positioning is geometry and is covered by path2.spec.ts
// (generateBounds), which needs no DOM.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ExpressionBrickModel } from '@/models/brick';
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
