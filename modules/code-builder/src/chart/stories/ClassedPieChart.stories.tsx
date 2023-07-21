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
    config: {
      innerCircleVisible: true,
      levels: 3,
      colors: ['#ff0000', '#00ff00', '#0000ff'],
      backgroundColor: '#ffffff',
    },
  },
};
