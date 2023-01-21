import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
import { default as WTextButton } from '.';

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
} as ComponentMeta<typeof WTextButton>;

const Template: ComponentStory<typeof WTextButton> = (args) => <WTextButton {...args} />;

export const Button = Template.bind({});
Button.args = {
  content: "BUTTON",
  handlerClick: linkTo('Common/WTextButton', 'Button'),
};
