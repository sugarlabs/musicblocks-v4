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
  title: 'BurstPieChart',
  ...MetaData,
};

export const BurstPieChartStory: Story = {
  args: {
    config: {
      dataColors: ['#0038FE', '#00F49F', '#FFAA28', '#002865'],
      subDataColors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6032', '#FF3042'],
      backgroundColor: '#ffffff',
      data: [
        {
          name: 'A',
          value: 1,
          subData: [
            { name: 'A', value: 1 },
            { name: 'E', value: 1 },
            { name: 'F', value: 1 },
          ],
        },
        {
          name: 'B',
          value: 1,
          subData: [
            { name: 'A', value: 1 },
            { name: 'B', value: 1 },
            { name: 'C', value: 1 },
            { name: 'D', value: 1 },
            { name: 'E', value: 1 },
            { name: 'F', value: 1 },
          ],
        },
        {
          name: 'C',
          value: 1,
          subData: [
            { name: 'A', value: 1 },
            { name: 'B', value: 1 },
            { name: 'C', value: 1 },
            { name: 'D', value: 1 },
          ],
        },
        {
          name: 'D',
          value: 1,
          subData: [
            { name: 'A', value: 1 },
            { name: 'B', value: 1 },
            { name: 'C', value: 1 },
            { name: 'D', value: 1 },
            { name: 'E', value: 1 },
          ],
        },
      ],
      handler(name) {
        console.log('>>=+=>> ', name);
      },
    },
  },
};
