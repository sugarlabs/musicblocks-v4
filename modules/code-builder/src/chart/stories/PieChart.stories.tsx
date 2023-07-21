import type { Meta, StoryObj } from '@storybook/react';
import PieChart from '../components/PieChart';

const MetaData: Meta<typeof PieChart> = {
  component: PieChart,
  parameters: {
    layout: 'centered',
  },
};

type Story = StoryObj<typeof PieChart>;

export default {
  title: 'PieChart',
  ...MetaData,
};

export const PieChartStory: Story = {
  args: {
    config: {
      innerCircleVisible: true,
      levels: 3,
      colors: ['#ff0000', '#00ff00', '#0000ff'],
      backgroundColor: '#ffffff',
    },
  },
};
