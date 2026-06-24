// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { BrickViewInput } from '../BrickViewInput';

afterEach(cleanup);

const colorsDefault = {
  background: '#e67e22',
  foreground: '#ffffff',
  border: '#d35400',
};

describe('BrickViewInput rendering', () => {
  it('renders a select widget with options', () => {
    render(
      <BrickViewInput
        kind="value"
        colorsDefault={colorsDefault}
        widget={{
          type: 'select',
          options: ['Option 1', 'Option 2'],
          value: 'Option 1',
        }}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();
    
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toBe('Option 1');
    expect(options[1].textContent).toBe('Option 2');
  });

  it('renders a textbox widget', () => {
    render(
      <BrickViewInput
        kind="value"
        colorsDefault={colorsDefault}
        widget={{
          type: 'textbox',
          value: 'Test value',
        }}
      />,
    );

    const textbox = screen.getByRole('textbox') as HTMLInputElement;
    expect(textbox).toBeDefined();
    expect(textbox.value).toBe('Test value');
  });

  it('renders a numberbox widget', () => {
    render(
      <BrickViewInput
        kind="value"
        colorsDefault={colorsDefault}
        widget={{
          type: 'numberbox',
          value: 42,
        }}
      />,
    );

    const numberbox = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(numberbox).toBeDefined();
    expect(numberbox.value).toBe('42');
  });

  it('renders a toggle widget', () => {
    render(
      <BrickViewInput
        kind="value"
        colorsDefault={colorsDefault}
        widget={{
          type: 'toggle',
          value: true,
          labels: { on: 'Yes', off: 'No' },
        }}
      />,
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBe(true);
    
    const label = screen.getByText('Yes');
    expect(label).toBeDefined();
  });

  it('renders a slider widget', () => {
    render(
      <BrickViewInput
        kind="value"
        colorsDefault={colorsDefault}
        widget={{
          type: 'slider',
          value: 50,
          min: 0,
          max: 100,
        }}
      />,
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeDefined();
    expect(slider.value).toBe('50');
  });
});
