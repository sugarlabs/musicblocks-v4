import type { Meta, StoryObj } from '@storybook/react';
import Playground from './Playground';

const MetaData: Meta<typeof Playground> = {
  component: Playground,
  parameters: {
    layout: 'centered',
  },
};

type Story = StoryObj<typeof Playground>;

export default {
  title: 'Pallete Playground',
  ...MetaData,
};

export const PlayGroundStory: Story = {
  args: {
    config: {
      data: [],
    },
  },
};
