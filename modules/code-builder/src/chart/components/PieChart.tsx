import React from 'react';

type Props = {
  config: {
    innerCircleVisible: boolean;
    levels: number;
    colors: string[];
    backgroundColor: string;
  };
};

const PieChart: React.FC<Props> = (props) => {
  console.log(props);
  return <div>PieChart</div>;
};

export default PieChart;
