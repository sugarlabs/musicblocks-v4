import React, { useState } from 'react';
import { BurstPieChartProps } from '@/@types/chart';
import { Cell, PieChart as PIE, Pie } from 'recharts';

const data = [
  { name: 'A', value: 5 },
  { name: 'B', value: 5 },
  { name: 'C', value: 5 },
  { name: 'D', value: 5 },
];

const subData = [
  { name: 'A', value: 5 },
  { name: 'B', value: 5 },
  { name: 'C', value: 5 },
  { name: 'D', value: 5 },
  { name: 'E', value: 5 },
  { name: 'F', value: 5 },
];

const DATACOLORS = ['#0038FE', '#00F49F', '#FFAA28', '#002865'];
const SUBDATACOLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6032', '#FF3042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${data[index].name}`}
    </text>
  );
};

const BurstPieChart: React.FC<BurstPieChartProps> = (props) => {
  const { config } = props;
  const [subDataOpen, setSubDataOpen] = useState(-1);

  console.log(config);

  const handleDataClick = (index: number): void => {
    subDataOpen === -1 ? setSubDataOpen(index) : setSubDataOpen(-1);
    console.log(index);
    console.log(subDataOpen === 0 ? 0 : subDataOpen * 90);
    console.log(subDataOpen === 0 ? 90 : subDataOpen * 90 + 90);

    return;
  };

  const handleSubDataClick = (index: number): void => {
    console.log(index);
  };

  return (
    <PIE width={400} height={400} style={{ outline: 'none' }}>
      <Pie
        data={data}
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
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={DATACOLORS[index % DATACOLORS.length]}
            onClick={() => handleDataClick(index)}
          />
        ))}
      </Pie>
      {subDataOpen !== -1 ? (
        <Pie
          dataKey="value"
          startAngle={subDataOpen === 0 ? 0 : subDataOpen * 90}
          endAngle={subDataOpen === 0 ? 90 : subDataOpen * 90 + 90}
          data={subData}
          cx={'50%'}
          cy={'50%'}
          innerRadius={60}
          outerRadius={120}
          isAnimationActive={false}
        >
          {subData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={SUBDATACOLORS[index % SUBDATACOLORS.length]}
              onClick={() => handleDataClick(index)}
            />
          ))}
        </Pie>
      ) : null}
    </PIE>
  );
};

export default BurstPieChart;
