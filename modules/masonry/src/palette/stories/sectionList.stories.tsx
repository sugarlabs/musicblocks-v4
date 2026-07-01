import React from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { SectionList } from '../components/sectionList';
import { sampleConfig } from '../data/sampleConfig';

export default {
  title: 'Palette/SectionList',
  component: SectionList,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof SectionList>;

const Template: StoryFn<React.ComponentProps<typeof SectionList>> = (args) => (
  <SectionList {...args} />
);

export const Default = Template.bind({});
Default.args = {
  sections: sampleConfig.categories[0].sections,
};

export const Empty = Template.bind({});
Empty.args = {
  sections: [],
};
