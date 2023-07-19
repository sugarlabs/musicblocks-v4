import type { Meta, StoryObj } from '@storybook/react';
import BurstPieChart from '../components/BurstPieChart';

const MetaData: Meta<typeof BurstPieChart> = {
  component: BurstPieChart,
  parameters: {
    layout: 'centered',
  },
};

type Story = StoryObj<typeof BurstPieChart>;

export default {
  title: 'Chart',
  ...MetaData,
};

export const BurstPieChartStory: Story = {
  args: {
    radius: 100,
  },
};
