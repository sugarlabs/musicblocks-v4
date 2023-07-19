import type { Meta, StoryObj } from '@storybook/react';
import ClassedPieChart from '../components/ClassedPieChart';

const MetaData: Meta<typeof ClassedPieChart> = {
  component: ClassedPieChart,
  parameters: {
    layout: 'centered',
  },
};

type Story = StoryObj<typeof ClassedPieChart>;

export default {
  title: 'ClassedPieChart',
  ...MetaData,
};

export const ClassedPieChartStory: Story = {
  args: {
    radius: 100,
  },
};
