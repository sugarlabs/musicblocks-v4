import React, { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { PaletteSearch } from '../components/paletteSearch';

export default {
  title: 'Palette/PaletteSearch',
  component: PaletteSearch,
  decorators: [
    (Story) => (
      <div style={{ width: '20rem', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof PaletteSearch>;

const Template: StoryFn<React.ComponentProps<typeof PaletteSearch>> = (args) => {
  const [value, setValue] = useState(args.value);
  return <PaletteSearch {...args} value={value} onChange={setValue} />;
};

export const Default = Template.bind({});
Default.args = {
  value: '',
};
