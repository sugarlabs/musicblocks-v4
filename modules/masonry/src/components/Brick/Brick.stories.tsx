import type { Meta, StoryObj } from '@storybook/react-vite';

import { BrickView } from './Brick';

import mouseSvg from '@/assets/mouse.svg';

const meta = {
  title: 'Brick/Brick View',
  component: BrickView,
  parameters: {
    layout: 'centered',
  },
  args: {
    tooltipText: '',
  },
  argTypes: {
    scaleLevel: {
      control: { type: 'radio' },
      options: [1, 2, 3],
    },
  },
} satisfies Meta<typeof BrickView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Fixed / Display ─────────────────────────────────────────────────────────

export const ValueLabel: Story = {
  args: {
    kind: 'value',
    colorsDefault: {
      background: '#3498db',
      foreground: '#ffffff',
      border: '#2980b9',
    },
    widget: {
      type: 'label',
      text: 'Variable',
    },
  },
};
ValueLabel.storyName = 'Value - Label';

export const ExpressionLabel: Story = {
  args: {
    kind: 'expression',
    colorsDefault: {
      background: '#2ecc71',
      foreground: '#ffffff',
      border: '#27ae60',
    },
    widget: {
      type: 'label',
      text: 'Add',
    },
    paramArgs: [
      { param: 'A', argDims: { w: 40, h: 20 } },
      { param: 'B', argDims: { w: 40, h: 20 } },
    ],
  },
};
ExpressionLabel.storyName = 'Expression - Label';

export const ExpressionVariant: Story = {
  args: {
    kind: 'expression',
    colorsDefault: {
      background: '#ff7979ff',
      foreground: '#000000ff',
      border: '#eb4d4bff',
    },
    widget: {
      type: 'variant',
      options: ['Option 1', 'Option 2', 'Option 3'],
      value: 'Option 1',
    },
    paramArgs: [
      { param: 'num 1', argDims: { w: 40, h: 20 } },
      { param: 'num 2', argDims: { w: 40, h: 20 } },
    ],
  },
};
ExpressionVariant.storyName = 'Expression - Variant';

export const StatementSimple: Story = {
  args: {
    kind: 'statement',
    colorsDefault: {
      background: '#9b59b6',
      foreground: '#ffffff',
      border: '#8e44ad',
    },
    widget: {
      type: 'label',
      text: 'Simple Statement',
    },
    hasConnectionPrev: true,
    hasConnectionNext: true,
    paramArgs: [{ param: 'delay', argDims: { w: 40, h: 20 } }],
  },
};

export const StatementNested: Story = {
  args: {
    kind: 'statement',
    colorsDefault: {
      background: '#f1c40f',
      foreground: '#333333',
      border: '#f39c12',
    },
    widget: {
      type: 'label',
      text: 'Repeat',
      glyph: { src: mouseSvg },
    },
    hasConnectionPrev: true,
    hasConnectionNext: true,
    paramArgs: [{ param: 'times', argDims: { w: 30, h: 20 } }],
    nesting: {
      dims: { w: 100, h: 60 },
      isFolded: false,
    },
  },
};

// ─── Input ───────────────────────────────────────────────────────────────────

const inputColors = {
  background: '#f1c40f',
  foreground: '#333333',
  border: '#f39c12',
};

export const ValueTextbox: Story = {
  args: {
    kind: 'value',
    colorsDefault: inputColors,
    widget: {
      type: 'textbox',
      value: 'Hello',
      maxLength: 20,
    },
  },
};
ValueTextbox.storyName = 'Value - Textbox';

export const ValueNumberbox: Story = {
  args: {
    kind: 'value',
    colorsDefault: inputColors,
    widget: {
      type: 'numberbox',
      value: 5,
      min: 0,
      max: 10,
      step: 1,
    },
  },
};
ValueNumberbox.storyName = 'Value - Numberbox';

export const ValueToggle: Story = {
  args: {
    kind: 'value',
    colorsDefault: inputColors,
    widget: {
      type: 'toggle',
      value: true,
      labels: { on: 'Yes', off: 'No' },
    },
  },
};
ValueToggle.storyName = 'Value - Toggle';

export const ValueSlider: Story = {
  args: {
    kind: 'value',
    colorsDefault: inputColors,
    widget: {
      type: 'slider',
      value: 50,
      min: 0,
      max: 100,
      step: 5,
    },
  },
};
ValueSlider.storyName = 'Value - Slider';

export const ValueSelect: Story = {
  args: {
    kind: 'value',
    colorsDefault: inputColors,
    widget: {
      type: 'select',
      options: ['Option 1', 'Option 2', 'Option 3'],
      value: 'Option 1',
    },
  },
};
ValueSelect.storyName = 'Value - Select';
