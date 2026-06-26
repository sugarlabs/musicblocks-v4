import type { Meta, StoryObj } from '@storybook/react-vite';

import { BrickViewInput } from '../components/BrickViewInput';

const meta = {
  title: 'BRICKS/BrickViewInput',
  component: BrickViewInput,
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
} satisfies Meta<typeof BrickViewInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const colorsDefault = {
  background: '#f1c40f',
  foreground: '#333333',
  border: '#f39c12',
};

export const SelectWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault,
    widget: {
      type: 'select',
      options: ['Option 1', 'Option 2', 'Option 3'],
      value: 'Option 1',
    },
  },
};

export const TextboxWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault,
    widget: {
      type: 'textbox',
      value: 'Hello',
      maxLength: 20,
    },
  },
};

export const NumberboxWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault,
    widget: {
      type: 'numberbox',
      value: 5,
      min: 0,
      max: 10,
      step: 1,
    },
  },
};

export const ToggleWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault,
    widget: {
      type: 'toggle',
      value: true,
      labels: { on: 'Yes', off: 'No' },
    },
  },
};

export const SliderWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault,
    widget: {
      type: 'slider',
      value: 50,
      min: 0,
      max: 100,
      step: 5,
    },
  },
};
