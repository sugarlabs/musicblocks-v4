import React from 'react';

type Props = {
  config: {
    innerCircleVisible: boolean;
    levels: number;
    colors: string[];
    backgroundColor: string;
  };
};

const ClassedPieChart: React.FC<Props> = (props) => {
  console.log(props);
  return <div>ClassedPieChart</div>;
};

export default ClassedPieChart;
