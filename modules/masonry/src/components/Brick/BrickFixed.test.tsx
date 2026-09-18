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

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Size } from '@/@types/common.types';

import { ExpressionBrickModel, StatementBrickModel } from '@/models/brick';
import { FOLD_TOGGLE_SELECTOR, SCALE_LEVEL_CONFIG } from '@/utils/constants';

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

/**
 * Renders a nesting statement brick with a labelled param, wired to `fold`, and hands back the
 * model, the toggle's press handler and the container.
 *
 * The param is what makes the brick worth rendering here: it is right aligned against the same
 * corner the toggle is overlaid on, so it is the label the toggle has to stay clear of.
 */
function renderFoldableBrick(
  options: { isCavityEmpty?: boolean; isFolded?: boolean; scaleLevel?: 1 | 2 | 3 } = {},
) {
  const { isCavityEmpty = false, isFolded = false, scaleLevel = 2 } = options;

  const model = new StatementBrickModel({
    colorsDefault,
    tooltipText: '',
    widget: { type: 'label', text: 'repeat' },
    params: ['times'],
    hasNesting: true,
    nestingDims: isCavityEmpty ? null : { w: 120, h: 200 },
    isNestingFolded: isFolded,
  });
  model.scaleLevel = scaleLevel;

  const onToggle = vi.fn();
  const { container } = render(
    <BrickViewFixed kind="statement" model={model} fold={{ isCavityEmpty, onToggle }} />,
  );

  return { model, onToggle, container };
}

/** The fold toggle, or null on a brick that has none. */
function foldToggle(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector<HTMLButtonElement>(FOLD_TOGGLE_SELECTOR);
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

describe('BrickViewFixed fold toggle', () => {
  it('is there on a nesting brick and nowhere else', () => {
    const { container } = renderFoldableBrick();
    const plain = renderStatementBrick(null);

    expect(foldToggle(container)).not.toBeNull();
    expect(foldToggle(plain.container)).toBeNull();
  });

  it('stays on a folded brick, which would otherwise read as a plain statement', () => {
    const { container } = renderFoldableBrick({ isFolded: true });

    expect(foldToggle(container)).not.toBeNull();
  });

  it('points down at an open cavity and right at a folded one', () => {
    const open = renderFoldableBrick();
    const folded = renderFoldableBrick({ isFolded: true });

    expect(foldToggle(open.container)!.getAttribute('aria-expanded')).toBe('true');
    expect(foldToggle(open.container)!.querySelector('svg')!.getAttribute('class')).toContain(
      'chevron-down',
    );

    expect(foldToggle(folded.container)!.getAttribute('aria-expanded')).toBe('false');
    expect(foldToggle(folded.container)!.querySelector('svg')!.getAttribute('class')).toContain(
      'chevron-right',
    );
  });

  it('turns around as the fold is flipped under it', () => {
    const { model, container } = renderFoldableBrick();

    act(() => {
      model.isNestingFolded = true;
    });

    expect(foldToggle(container)!.getAttribute('aria-expanded')).toBe('false');
  });

  it('hands a press to the tower rather than writing the flag itself', () => {
    const { model, onToggle, container } = renderFoldableBrick();

    fireEvent.click(foldToggle(container)!);

    // The fold has to go through the tower: it decides what gets laid out and drawn, so the view
    // reports the press and leaves the write to whoever owns the tower.
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(model.isNestingFolded).toBe(false);
  });

  it('is disabled, and unpressable, while the cavity is empty', () => {
    const { onToggle, container } = renderFoldableBrick({ isCavityEmpty: true });
    const toggle = foldToggle(container)!;

    expect(toggle.disabled).toBe(true);

    fireEvent.click(toggle);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('is disabled on a brick with no tower behind it at all', () => {
    // What a palette preview, a drag ghost or a snap preview renders: a nesting brick with no
    // `fold` wiring. The toggle is still drawn, so the brick keeps its silhouette.
    const model = new StatementBrickModel({
      colorsDefault,
      tooltipText: '',
      widget: { type: 'label', text: 'repeat' },
      hasNesting: true,
      nestingDims: null,
    });
    const { container } = render(<BrickViewFixed kind="statement" model={model} />);

    expect(foldToggle(container)!.disabled).toBe(true);
  });

  it('sizes itself off SCALE_LEVEL_CONFIG at every scale level', () => {
    for (const level of [1, 2, 3] as const) {
      const { container } = renderFoldableBrick({ scaleLevel: level });
      const toggle = foldToggle(container)!;

      // The generator reserves a square of the head's minimum content height, which is that level's
      // `minWidgetParamHeight` once it is back in pixel space.
      const { minWidgetParamHeight } = SCALE_LEVEL_CONFIG[level];
      expect(toggle.style.width).toBe(`${minWidgetParamHeight}px`);
      expect(toggle.style.height).toBe(`${minWidgetParamHeight}px`);

      cleanup();
    }
  });

  it('sits inside the head, clear of the param label right aligned against the same corner', () => {
    const { container } = renderFoldableBrick();

    const slots = [...container.querySelectorAll('foreignObject')];
    const toggleSlot = slots.find((slot) => slot.querySelector(FOLD_TOGGLE_SELECTOR))!;
    const paramSlot = slots.find((slot) => slot.textContent === 'times')!;

    const left = (slot: Element) => Number(slot.getAttribute('x'));
    const brickWidth = Number(container.querySelector('svg')!.getAttribute('width'));

    // Overlaid, so it is drawn within the outline it does not widen.
    expect(left(toggleSlot) + Number(toggleSlot.getAttribute('width'))).toBeLessThanOrEqual(
      brickWidth,
    );
    // And the label gave way rather than being drawn under it. Compared on the origins, not the
    // right edges: jsdom measures the label as zero-wide, so a param slot falls back to a
    // placeholder width. How wide a real label may be before it reaches the toggle is geometry, and
    // brick-shape.test.ts covers it without needing a DOM.
    expect(left(paramSlot)).toBeLessThan(left(toggleSlot));
  });

  it('is marked for interact.js, so a press on it cannot start a brick drag', () => {
    const { container } = renderFoldableBrick();

    // `useBrickMove` passes this selector as the draggable's `ignoreFrom`; the attribute is what
    // makes the toggle match it.
    expect(container.querySelectorAll(FOLD_TOGGLE_SELECTOR)).toHaveLength(1);
  });
});
