import React from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { Palette } from '../palette';
import { sampleConfig } from '../data/sampleConfig';

export default {
  title: 'Palette/Palette',
  component: Palette,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof Palette>;

const Template: StoryFn<React.ComponentProps<typeof Palette>> = (args) => <Palette {...args} />;

export const Default = Template.bind({});
Default.args = {
  config: sampleConfig,
};
