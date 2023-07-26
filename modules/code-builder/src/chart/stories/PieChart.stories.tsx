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
          { name: 'A', value: 400, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'B', value: 300, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'C', value: 300, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
        ],
        [
          { name: 'D', value: 400, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'E', value: 300, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'F', value: 200, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
        ],
        [
          { name: 'G', value: 400, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
          { name: 'H', value: 200, colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] },
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
