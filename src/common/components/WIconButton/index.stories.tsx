import type { Meta, StoryObj } from '@storybook/react';

import { default as WIconButton } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WIconButton',
  component: WIconButton,
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
} as Meta<typeof WIconButton>;

type Story = StoryObj<typeof WIconButton>;

// -------------------------------------------------------------------------------------------------

export const Button: Story = {
  args: {
    content: 'BUTTON',
    handlerClick: () => undefined,
  },
};
