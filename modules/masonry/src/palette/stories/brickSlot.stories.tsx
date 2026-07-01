import React from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { BrickSlot } from '../components/brickSlot';
import { sampleConfig } from '../data/sampleConfig';

const sampleBrick = sampleConfig.categories[0].sections[0].bricks[0];

export default {
  title: 'Palette/BrickSlot',
  component: BrickSlot,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', width: '16rem' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    brick: { control: 'object' },
  },
} as Meta<typeof BrickSlot>;

const Template: StoryFn<React.ComponentProps<typeof BrickSlot>> = (args) => <BrickSlot {...args} />;

export const Default = Template.bind({});
Default.args = {
  brick: sampleBrick,
};
