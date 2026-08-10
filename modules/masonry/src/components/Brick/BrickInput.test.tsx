// Component test for BrickViewInput. Unlike the pure-math path2 specs, this
// renders the React component into a DOM (jsdom) via React Testing Library and
// asserts on the produced markup.
//
// Scope note: jsdom does no real layout (getBoundingClientRect() returns zeros,
// SVG geometry is not computed), so this file only covers what the component
// sets *declaratively* — the widget's color, font size, and value rendering. The outline
// path generation is geometry and is covered by path2 specs, which need no DOM.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { WidgetInput } from '@/@types/brick.types';

import { ValueBrickModel } from '@/models/brick';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

import { BrickViewInput } from './BrickInput';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(cleanup);

const colorsDefault = {
  background: '#4f46e5',
  foreground: '#ffffff',
  border: '#4338ca',
};

/** Renders a value brick with an interactive input widget via a model. */
function renderValueBrickInput(widget: WidgetInput, scaleLevel: 1 | 2 | 3 = 2) {
  const model = new ValueBrickModel({
    colorsDefault,
    tooltipText: '',
    widget,
  });
  model.scaleLevel = scaleLevel;

  return render(
    <BrickViewInput kind="value" model={model as ValueBrickModel & { widget: WidgetInput }} />,
  );
}

describe('BrickViewInput widget styling and scaling', () => {
  it('uses the configured foreground color for the input widget', async () => {
    renderValueBrickInput({ type: 'textbox', value: 'Hello' });

    const input = await screen.findByDisplayValue('Hello');

    // Compare the rendered values directly against a DOM element normalized by jsdom
    // (e.g. "#ffffff" -> "rgb(255, 255, 255)"), so equality is robust.
    const dummy = document.createElement('span');
    dummy.style.color = colorsDefault.foreground;

    expect(input.style.color).toBe(dummy.style.color);
  });

  it('uses the full label font size (1.0x) from SCALE_LEVEL_CONFIG', async () => {
    const scaleLevel = 2;
    renderValueBrickInput({ type: 'textbox', value: 'Hello' }, scaleLevel);

    const { fontSize } = SCALE_LEVEL_CONFIG[scaleLevel];
    const input = await screen.findByDisplayValue('Hello');

    expect(input.style.fontSize).toBe(`${fontSize}px`);
  });

  it('scales the widget font with the brick scale level', async () => {
    const scaleLevel = 3;
    renderValueBrickInput({ type: 'textbox', value: 'Hello' }, scaleLevel);

    const { fontSize } = SCALE_LEVEL_CONFIG[scaleLevel];
    const input = await screen.findByDisplayValue('Hello');

    expect(input.style.fontSize).toBe(`${fontSize}px`);
  });
});

describe('BrickViewInput widget types', () => {
  it('renders a textbox widget with default value and maxLength', async () => {
    renderValueBrickInput({ type: 'textbox', value: 'Hello world', maxLength: 15 });

    const input = (await screen.findByDisplayValue('Hello world')) as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('text');
    expect(input.value).toBe('Hello world');
    expect(input.maxLength).toBe(15);
  });

  it('renders a numberbox widget with default value, min, max, and step', async () => {
    renderValueBrickInput({ type: 'numberbox', value: 42, min: 0, max: 100, step: 5 });

    const input = (await screen.findByDisplayValue('42')) as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('number');
    expect(input.value).toBe('42');
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
    expect(input.step).toBe('5');
  });

  it('renders a toggle widget with checked state and labels', async () => {
    renderValueBrickInput({
      type: 'toggle',
      value: true,
      labels: { on: 'Active', off: 'Inactive' },
    });

    const checkbox = (await screen.findByRole('checkbox')) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Inactive')).toBeDefined();
  });

  it('renders a slider widget with min and max labels', async () => {
    renderValueBrickInput({ type: 'slider', value: 50, min: 10, max: 90, step: 10 });

    expect(await screen.findByText('10')).toBeDefined();
    expect(screen.getByText('90')).toBeDefined();
  });

  it('renders a select widget with options and default value', async () => {
    renderValueBrickInput({
      type: 'select',
      options: ['Option A', 'Option B', 'Option C'],
      value: 'Option B',
    });

    const trigger = await screen.findByRole('combobox');
    expect(trigger).toBeDefined();
    expect(screen.getByText('Option B')).toBeDefined();
  });
});
