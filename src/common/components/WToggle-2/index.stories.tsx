import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
import { default as WToggleSwitch2 } from '.';

export default {
  title: 'Common/WToggleSwitch2',
  component: WToggleSwitch2,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof WToggleSwitch2>;

const Template: ComponentStory<typeof WToggleSwitch2> = (args) => <WToggleSwitch2 {...args} />;

export const Active = Template.bind({});
Active.args = {
  active: true,
  handlerClick: linkTo('Common/WToggleSwitch2', 'InActive'),
};

export const Inactive = Template.bind({});
Inactive.args = {
  active: false,
  handlerClick: linkTo('Common/WToggleSwitch2', 'Active'),
};
