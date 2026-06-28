import type { Meta, StoryObj } from '@storybook/react-vite';

import { BrickViewFixed } from './BrickFixed';

import mouseSvg from '@/assets/mouse.svg';

const meta = {
  title: 'Brick/BrickFixed',
  component: BrickViewFixed,
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
} satisfies Meta<typeof BrickViewFixed>;

export default meta;
type Story = StoryObj<typeof meta>;

const colorsDefault = {
  background: '#3498db',
  foreground: '#ffffff',
  border: '#2980b9',
};

export const ValueDisplayWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault,
    widget: {
      type: 'label',
      text: 'Variable',
    },
  },
};

export const ExpressionWithParams: Story = {
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
      {
        param: 'A',
        argDims: { w: 40, h: 20 },
      },
      {
        param: 'B',
        argDims: { w: 40, h: 20 },
      },
    ],
  },
};

export const StatementWithoutNesting: Story = {
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
    paramArgs: [
      {
        param: 'delay',
        argDims: { w: 40, h: 20 },
      },
    ],
    // Omit nesting entirely
  },
};

export const StatementWithNesting: Story = {
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
    paramArgs: [
      {
        param: 'times',
        argDims: { w: 30, h: 20 },
      },
    ],
    nesting: {
      dims: { w: 100, h: 60 },
      isFolded: false,
    },
  },
};

export const VariantWidget: Story = {
  args: {
    kind: 'expression',
    colorsDefault: {
      background: '#48ff00ff',
      foreground: '#000000ff',
      border: '#06ca06ff',
    },
    widget: {
      type: 'variant',
      options: ['Option 1', 'Option 2', 'Option 3'],
      value: 'Option 1',
    },
    paramArgs: [
      {
        param: 'num 1',
        argDims: { w: 40, h: 20 },
      },
      {
        param: 'num 2',
        argDims: { w: 40, h: 20 },
      },
    ],
  },
};
