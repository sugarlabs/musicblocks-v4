import React from 'react';

type Props = {
  config: {
    innerCircleVisible: boolean;
    levels: number;
    colors: string[];
    backgroundColor: string;
  };
};

const BurstPieChart: React.FC<Props> = (props) => {
  console.log(props);
  return <div>BurstPieChart</div>;
};

export default BurstPieChart;
