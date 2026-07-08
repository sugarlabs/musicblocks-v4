import React from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { SimpleBrickView } from '../components/simple';
import type { TBrickRenderPropsSimple } from '../../../@types/brick';

export default {
  title: 'Old/Bricks/SimpleBrick',
  component: SimpleBrickView,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    // Core appearance
    label: { control: 'text' },
    labelType: {
      control: { type: 'select', options: ['text', 'glyph', 'icon', 'thumbnail'] },
    },
    colorBg: { control: 'color' },
    colorFg: { control: 'color' },
    strokeColor: { control: 'color' },
    strokeWidth: { control: { type: 'number', min: 1, max: 10, step: 1 } },
    scale: { control: { type: 'number', min: 0.5, max: 3, step: 0.1 } },
    shadow: { control: 'boolean' },
    tooltip: { control: 'text' },

    // Layout
    bboxArgs: { control: 'object' },
    isActionMenuOpen: { control: 'boolean' },
    isVisible: { control: 'boolean' },

    // Simple-specific
    topNotch: { control: 'boolean' },
    bottomNotch: { control: 'boolean' },
  },
} as Meta<typeof SimpleBrickView>;

const Template: StoryFn<TBrickRenderPropsSimple> = (args) => <SimpleBrickView {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'doSomething',
  labelType: 'text',
  colorBg: '#aad3df',
  colorFg: '#000000',
  strokeColor: '#000000',
  strokeWidth: 1,
  scale: 1,
  shadow: true,
  tooltip: 'A simple statement brick',
  bboxArgs: [],
  isActionMenuOpen: false,
  isVisible: true,
  topNotch: true,
  bottomNotch: true,
};
