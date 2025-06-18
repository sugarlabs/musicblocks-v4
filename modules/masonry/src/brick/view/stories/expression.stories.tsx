// src/brick/view/components/expression.stories.tsx
import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import ExpressionBrickView from '../components/expression';
import type { TColor, TExtent, TVisualState } from '../../@types/brick';

export default {
  title: 'Bricks/ExpressionBrick',
  component: ExpressionBrickView,
  argTypes: {
    // Core appearance controls
    colorBg: { control: 'color' },
    colorFg: { control: 'color' },
    strokeColor: { control: 'color' },
    label: { control: 'text' },
    value: { control: 'text' },

    // State controls
    visualState: {
      control: {
        type: 'select',
        options: ['default', 'hovered', 'selected', 'executing', 'unconnected', 'dragged'],
      },
    },
    isValueSelectOpen: { control: 'boolean' },
    isVisible: { control: 'boolean' },

    // Layout & interaction
    scale: { control: { type: 'number', min: 0.1, max: 3, step: 0.1 } },
    x: { control: 'number' },
    y: { control: 'number' },
    onClick: { action: 'clicked' },
  },
} as Meta<typeof ExpressionBrickView>;

type Props = React.ComponentProps<typeof ExpressionBrickView>;

const Template: StoryFn<Props> = (args) => <ExpressionBrickView {...args} />;

export const Default = Template.bind({});
Default.args = {
  uuid: 'expr-1',
  name: 'expr-1',
  label: 'x + y',
  labelType: 'text',
  colorBg: '#EEE',
  colorFg: '#222',
  strokeColor: '#444',
  shadow: false,
  scale: 1,
  tooltip: 'An expression brick',
  value: 42,
  isValueSelectOpen: false,
  bboxArgs: [],
  x: 0,
  y: 0,
  visualState: 'default',
  isVisible: true,
};

export const Hovered = Template.bind({});
Hovered.args = { ...Default.args, visualState: 'hovered' };

export const Selected = Template.bind({});
Selected.args = { ...Default.args, visualState: 'selected' };

export const Executing = Template.bind({});
Executing.args = { ...Default.args, visualState: 'executing' };

export const Unconnected = Template.bind({});
Unconnected.args = { ...Default.args, visualState: 'unconnected' };

export const Dragged = Template.bind({});
Dragged.args = { ...Default.args, visualState: 'dragged' };

export const ValuePickerOpen = Template.bind({});
ValuePickerOpen.args = {
  ...Default.args,
  isValueSelectOpen: true,
};
