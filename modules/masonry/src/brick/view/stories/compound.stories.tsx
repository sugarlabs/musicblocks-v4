// src/masonry/view/CompoundBrickView.stories.tsx

import React from 'react';
import type { Meta, StoryObj, Decorator } from '@storybook/react';
import { CompoundBrickView } from '../components/compound';
import type { TBrickRenderPropsCompound } from '../../@types/brick';

const centerDecorator: Decorator<TBrickRenderPropsCompound> = (Story) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Story />
  </div>
);

const meta: Meta<TBrickRenderPropsCompound> = {
  title: 'Bricks/CompoundBrick',
  component: CompoundBrickView,
  decorators: [centerDecorator],
  argTypes: {
    label: { control: 'text' },
    colorBg: { control: 'color' },
    colorFg: { control: 'color' },
    strokeColor: { control: 'color' },
    strokeWidth: { control: { type: 'number', min: 0, max: 10, step: 1 } },
    scale: { control: { type: 'number', min: 0.1, max: 3, step: 0.1 } },
    shadow: { control: 'boolean' },
    tooltip: { control: 'text' },
    topNotch: { control: 'boolean' },
    bottomNotch: { control: 'boolean' },
    isFolded: { control: 'boolean' },
    bboxArgs: { control: 'object' },
    bboxNest: { control: 'object' },

    // plumbing
    labelType: { table: { disable: true } },
    isActionMenuOpen: { table: { disable: true } },
    isVisible: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<TBrickRenderPropsCompound>;

/** The default compound-statement brick */
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
    tooltip: 'A compound-statement brick',
    bboxArgs: [],
    bboxNest: [],
    topNotch: true,
    bottomNotch: true,
    isFolded: false,
    isActionMenuOpen: false,
    isVisible: true,
  },
};
