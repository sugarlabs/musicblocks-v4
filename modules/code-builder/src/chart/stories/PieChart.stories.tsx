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
      backgroundColor: '#ffffff',
      data: [
        [
          { name: 'A', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'B', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'C', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'I', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
        ],
        [
          { name: 'D', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'E', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'F', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'J', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
        ],
        [
          { name: 'G', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'H', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'K', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'L', value: 1, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
        ],
      ],
      handler: (name) => {
        console.log(name);
      },
      handleClose() {
        console.log('close');
      },
    },
  },
};
