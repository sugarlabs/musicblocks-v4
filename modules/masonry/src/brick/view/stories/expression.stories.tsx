import React from 'react';
import type { Meta, StoryObj, Decorator } from '@storybook/react-vite';
import { ExpressionBrickView } from '../components/expression';
import type { TBrickRenderPropsExpression } from '../../../@types/brick';

const centerDecorator: Decorator<TBrickRenderPropsExpression> = (Story) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Story />
  </div>
);

const meta: Meta<TBrickRenderPropsExpression> = {
  title: 'Old/Bricks/ExpressionBrick',
  component: ExpressionBrickView,
  decorators: [centerDecorator],
  argTypes: {
    // exposed controls
    label: { control: 'text' },
    colorBg: { control: 'color' },
    colorFg: { control: 'color' },
    strokeColor: { control: 'color' },
    strokeWidth: { control: { type: 'number', min: 0, max: 10, step: 1 } },
    scale: { control: { type: 'number', min: 0.1, max: 3, step: 0.1 } },
    shadow: { control: 'boolean' },
    tooltip: { control: 'text' },
    value: { control: 'text' },
    isValueSelectOpen: { control: 'boolean' },

    // hide plumbing props
    labelType: { table: { disable: true } },
    bboxArgs: { table: { disable: true } },
    isActionMenuOpen: { table: { disable: true } },
    isVisible: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<TBrickRenderPropsExpression>;

/**
 * Default story: a plain expression brick with no value-select open.
 */
export const Default: Story = {
  args: {
    label: 'doSomething',
    labelType: 'text',
    colorBg: '#aad3df',
    colorFg: '#000000',
    strokeColor: '#000000',
    strokeWidth: 1,
    scale: 1,
    shadow: true,
    tooltip: 'An expression brick',
    bboxArgs: [],
    isActionMenuOpen: false,
    isVisible: true,
    value: '',
    isValueSelectOpen: false,
  },
};
