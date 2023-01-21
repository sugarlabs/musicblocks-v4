import type { Meta, StoryObj } from '@storybook/react';

import { Splash } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'View/Splash',
  component: Splash,
  decorators: [
    (Story) => (
      <div id="stories-splash-wrapper">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    progress: {
      options: [0, 20, 40, 60, 80, 100],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <Splash {...args} />,
} as Meta<typeof Splash>;

type Story = StoryObj<typeof Splash>;

// -------------------------------------------------------------------------------------------------

export const SplashProgress: Story = {
  args: {
    progress: 0,
  },
  name: 'Progress',
};
