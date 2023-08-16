import type { Meta, StoryObj } from '@storybook/react';
import Pallete from './Pallete';

const MetaData: Meta<typeof Pallete> = {
  component: Pallete,
  parameters: {
    layout: 'centered',
  },
};

type Story = StoryObj<typeof Pallete>;

export default {
  title: 'Pallete',
  ...MetaData,
};

export const PalleteStory: Story = {
  args: {
    config: {
      data: [],
    },
  },
};
