import React, { useState } from 'react';
import { ClassedPieChartProps } from '@/@types/chart';
import { Cell, PieChart as PIE, Pie } from 'recharts';
import ScrollWheelHandler from 'react-scroll-wheel-handler';

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

const ClassedPieChart: React.FC<ClassedPieChartProps> = (props) => {
  const { config } = props;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabell1 = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    index = 0,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        transform={`rotate(${-midAngle}, ${x}, ${y})`}
        dominantBaseline="central"
      >
        {`${l1data[index].name}`}
      </text>
    );
  };

  const renderCustomizedLabell2 = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    index = 0,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        transform={`rotate(${-midAngle}, ${x}, ${y})`}
        dominantBaseline="central"
      >
        {`${l2data[index].name}`}
      </text>
    );
  };

  const renderCustomizedLabell3 = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    index = 0,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        transform={`rotate(${-midAngle}, ${x}, ${y})`}
        dominantBaseline="central"
      >
        {`${l3data[index].name}`}
      </text>
    );
  };

  const [rotationAngle, setRotationAngle] = useState(0);

  const handleScroll = (scrollDelta: number) => {
    console.log(scrollDelta);
    const rotationSpeed = 20;
    setRotationAngle((prevAngle) => prevAngle + scrollDelta * rotationSpeed);
  };
  const [activeSlice, setActiveSlice] = useState<{
    name: string;
    start: number;
    end: number;
  }>({
    name: '',
    start: 0,
    end: 0,
  });

  const handlePieMouseEnter = (e: any) => {
    const activeData = {
      name: e.name,
      start: e.startAngle,
      end: e.endAngle,
    };
    setActiveSlice(activeData);
  };

  const handleDataClick = (index: number): void => {
    console.log(index);
    return;
  };

  const handleSubDataClick = (index: number): void => {
    console.log(index);
  };
  return (
    <PIE width={400} height={400} style={{ outline: 'none' }}>
      {config.innerCircleVisible === true ? (
        <Pie
          data={[{ name: 'X', value: 1 }]}
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={30}
          fill={`${config.backgroundColor}`}
          labelLine={false}
          dataKey="value"
          isAnimationActive={false}
          style={{
            outline: 'none',
          }}
        >
          <Cell
            key={`cell-0`}
            fill={'#f8f8'}
            style={{
              outline: 'none',
            }}
            // onClick={config.handleClose}
          />
        </Pie>
      ) : null}
      <Pie
        data={l1data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabell1}
        innerRadius={config.innerCircleVisible === true ? 30 : 0}
        outerRadius={config.innerCircleVisible === true ? 60 : 30}
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
        labelLine={false}
        label={renderCustomizedLabell2}
        innerRadius={config.innerCircleVisible === true ? 60 : 90}
        outerRadius={config.innerCircleVisible === true ? 100 : 130}
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
        labelLine={false}
        label={renderCustomizedLabell3}
        innerRadius={config.innerCircleVisible === true ? 100 : 130}
        outerRadius={config.innerCircleVisible === true ? 130 : 160}
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
