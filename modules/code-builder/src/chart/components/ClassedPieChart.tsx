import React from 'react';
import { ClassedPieChartProps } from '@/@types/chart';
import { Cell, PieChart as PIE, Pie } from 'recharts';

const l1data = [
  { name: 'A', value: 5 },
  { name: 'B', value: 5 },
  { name: 'C', value: 5 },
  { name: 'D', value: 5 },
  { name: 'E', value: 5 },
  { name: 'F', value: 5 },
  { name: 'G', value: 5 },
];

const l2data = [
  { name: 'A', value: 5 },
  { name: 'B', value: 5 },
  { name: 'C', value: 5 },
  { name: 'D', value: 5 },
  { name: 'E', value: 5 },
];

const l3data = [
  { name: 'A', value: 5 },
  { name: 'B', value: 5 },
  { name: 'C', value: 5 },
  { name: 'D', value: 5 },
  { name: 'E', value: 5 },
  { name: 'F', value: 5 },
  { name: 'G', value: 5 },
  { name: 'H', value: 5 },
];

const DATACOLORS = ['#0038FE', '#00F49F', '#FFAA28', '#002865', '#FF8042', '#FF6032', '#FF3042'];
const SUBDATACOLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const SUBSUBDATACOLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#FF6032',
  '#FF3042',
  '#FF3042',
  '#FF3042',
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${l1data[index].name}`}
    </text>
  );
};

const ClassedPieChart: React.FC<ClassedPieChartProps> = (props) => {
  const { config } = props;

  console.log(config);

  const handleDataClick = (index: number): void => {
    console.log(index);
    return;
  };

  const handleSubDataClick = (index: number): void => {
    console.log(index);
  };
  return (
    <PIE width={400} height={400} style={{ outline: 'none' }}>
      <Pie
        data={l1data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel}
        outerRadius={60}
        fill="#8884d8"
        dataKey="value"
        isAnimationActive={false}
        style={{ outline: 'none' }}
      >
        {l1data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={DATACOLORS[index % DATACOLORS.length]}
            onClick={() => handleDataClick(index)}
          />
        ))}
      </Pie>
      <Pie
        dataKey="value"
        startAngle={-60}
        endAngle={60}
        data={l2data}
        cx={'50%'}
        cy={'50%'}
        innerRadius={60}
        outerRadius={100}
        isAnimationActive={false}
      >
        {l2data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={SUBDATACOLORS[index % SUBDATACOLORS.length]}
            onClick={() => handleDataClick(index)}
          />
        ))}
      </Pie>
      <Pie
        dataKey="value"
        startAngle={-90}
        endAngle={120}
        data={l3data}
        cx={'50%'}
        cy={'50%'}
        innerRadius={100}
        outerRadius={140}
        isAnimationActive={false}
      >
        {l2data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={SUBSUBDATACOLORS[index % SUBSUBDATACOLORS.length]}
            onClick={() => handleDataClick(index)}
          />
        ))}
      </Pie>
    </PIE>
  );
};

export default ClassedPieChart;
