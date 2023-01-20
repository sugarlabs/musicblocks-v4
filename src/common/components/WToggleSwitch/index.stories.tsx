import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
import { default as WToggleSwitch } from '.';

export default {
  title: 'Common/WToggleSwitch',
  component: WToggleSwitch,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof WToggleSwitch>;

const Template: ComponentStory<typeof WToggleSwitch> = (args) => <WToggleSwitch {...args} />;

export const Active = Template.bind({});
Active.args = {
  active: true,
  handlerClick: linkTo('Common/WToggleSwitch', 'Inactive'),
};

export const Inactive = Template.bind({});
Inactive.args = {
  active: false,
  handlerClick: linkTo('Common/WToggleSwitch', 'Active'),
};
