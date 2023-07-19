import React from 'react';
import BurstPieChart from './components/BurstPieChart';
import ClassedPieChart from './components/ClassedPieChart';
import PieChart from './components/PieChart';

type ChartType = 'burst' | 'classed' | 'pie';

interface ChartConfig {
  type: ChartType;
  innerCircleVisible: boolean;
  levels: number;
  colors: string[];
  backgroundColor: string;
  // data:
}

export interface ChartProps {
  chartConfig: ChartConfig;
}
type config = Omit<ChartConfig, 'type'>;

const Chart: React.FC<ChartProps> = (props) => {
  const { chartConfig } = props;
  const config: config = {
    innerCircleVisible: chartConfig.innerCircleVisible,
    levels: chartConfig.levels,
    colors: chartConfig.colors,
    backgroundColor: chartConfig.backgroundColor,
  };
  switch (chartConfig.type) {
    case 'burst':
      return <BurstPieChart config={config} />;
    case 'classed':
      return <ClassedPieChart config={config} />;
    case 'pie':
      return <PieChart config={config} />;
    default:
      return null;
  }
};

export default Chart;
