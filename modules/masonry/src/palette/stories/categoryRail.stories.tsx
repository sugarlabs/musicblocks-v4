import React, { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { CategoryRail } from '../components/categoryRail';
import { sampleConfig } from '../data/sampleConfig';

export default {
  title: 'Palette/CategoryRail',
  component: CategoryRail,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', width: '100%', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof CategoryRail>;

const Template: StoryFn<React.ComponentProps<typeof CategoryRail>> = (args) => {
  const [activeIndex, setActiveIndex] = useState(args.activeIndex);
  return <CategoryRail {...args} activeIndex={activeIndex} onSelect={setActiveIndex} />;
};

export const Default = Template.bind({});
Default.args = {
  categories: sampleConfig.categories,
  activeIndex: 0,
  orientation: 'horizontal',
};
