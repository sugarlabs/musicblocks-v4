import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './slider';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="w-[200px] flex items-center h-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};
export const Range: Story = { args: { defaultValue: [25, 75] } };
