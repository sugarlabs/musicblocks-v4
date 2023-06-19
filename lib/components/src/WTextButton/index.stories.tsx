import type { Meta, StoryObj } from '@storybook/react';

import { default as WTextButton } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WTextButton',
  component: WTextButton,
  decorators: [
    (Story) => (
      <div id="stories-button-wrapper">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof WTextButton>;

type Story = StoryObj<typeof WTextButton>;

// -------------------------------------------------------------------------------------------------

export const Button: Story = {
  args: {
    content: 'BUTTON',
    handlerClick: () => undefined,
  },
};
