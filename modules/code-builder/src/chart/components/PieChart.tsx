import { PieChartProps } from '@/@types/chart';
import React, { useState } from 'react';
import { Cell, PieChart as PIE, Pie } from 'recharts';
import ScrollWheelHandler from 'react-scroll-wheel-handler';

const PieChart: React.FC<PieChartProps> = (props) => {
  const { config } = props;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    index = 0,
    level = 0,
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
        {`${config.data[level][index].name}`}
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

  const handleclick = (level: number, index: number) => {
    console.log(level, index);
    config.handler(config.data[level][index].name);
  };
  return (
    <PIE
      width={400}
      height={400}
      style={{
        outline: 'none',
      }}
    >
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
            onClick={config.handleClose}
          />
        </Pie>
      ) : null}
      {config.data.map((levelData, ind) => {
        return (
          <Pie
            data={levelData}
            key={ind}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(p) => renderCustomizedLabel({ ...p, level: ind })}
            innerRadius={config.innerCircleVisible ? ind * 50 + 30 : ind * 50}
            outerRadius={config.innerCircleVisible ? ind * 50 + 50 + 30 : ind * 50 + 50}
            fill={`${config.backgroundColor}`}
            dataKey="value"
            isAnimationActive={false}
            style={{
              outline: 'none',
            }}
          >
            {levelData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={levelData[index].colors[index % levelData[index].colors.length]}
                style={{
                  outline: 'none',
                }}
                onClick={() => handleclick(ind, index)}
              />
            ))}
          </Pie>
        );
      })}
    </PIE>
  );
};

export default PieChart;
