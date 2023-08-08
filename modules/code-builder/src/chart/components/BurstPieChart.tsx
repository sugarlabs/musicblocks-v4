import React, { useState } from 'react';
import { BurstPieChartProps } from '@/@types/chart';
import { Cell, PieChart as PIE, Pie } from 'recharts';
import ScrollWheelHandler from 'react-scroll-wheel-handler';

const BurstPieChart: React.FC<BurstPieChartProps> = (props) => {
  const { config } = props;
  const [subDataOpen, setSubDataOpen] = useState(-1);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
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
        transform={`rotate(${-midAngle}, ${x}, ${y})`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${config.data[index].name}`}
      </text>
    );
  };

  const renderCustomizedSubDataLabel = ({
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
        transform={`rotate(${-midAngle}, ${x}, ${y})`}
        textAnchor={`middle`}
        dominantBaseline="central"
      >
        {`${config.data[subDataOpen].subData[index].name}`}
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
    if (e.name !== activeSlice?.name) subDataOpen !== -1 && setSubDataOpen(-1);
    const activeData = {
      name: e.name,
      start: e.startAngle,
      end: e.endAngle,
    };
    setActiveSlice(activeData);
  };

  const handleDataClick = (index: number): void => {
    if (subDataOpen === index) setSubDataOpen(-1);
    else setSubDataOpen(index);
    return;
  };

  const handleSubDataClick = (index: number): void => {
    config.handler(config.data[subDataOpen].subData[index].name);
  };

  return (
    <ScrollWheelHandler
      upHandler={(e) => handleScroll(e.deltaY)}
      downHandler={(e) => handleScroll(e.deltaY)}
    >
      <PIE width={400} height={400} style={{ outline: 'none' }}>
        <Pie
          data={config.data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={60}
          fill={config.backgroundColor}
          dataKey="value"
          isAnimationActive={false}
          style={{ outline: 'none' }}
          startAngle={rotationAngle}
          endAngle={360 + rotationAngle}
          onMouseEnter={handlePieMouseEnter}
        >
          {config.data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={config.dataColors[index % config.dataColors.length]}
              onClick={() => handleDataClick(index)}
              style={{ outline: 'none' }}
            />
          ))}
        </Pie>
        {subDataOpen !== -1 ? (
          <Pie
            dataKey="value"
            startAngle={activeSlice.start}
            endAngle={activeSlice.end}
            data={config.data[subDataOpen].subData}
            labelLine={false}
            label={renderCustomizedSubDataLabel}
            cx={'50%'}
            cy={'50%'}
            innerRadius={60}
            outerRadius={120}
            isAnimationActive={false}
            style={{ outline: 'none' }}
          >
            {config?.data[subDataOpen]?.subData?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={config.subDataColors[index % config.subDataColors.length]}
                onClick={() => handleSubDataClick(index)}
                style={{ outline: 'none' }}
              />
            ))}
          </Pie>
        ) : null}
      </PIE>
    </ScrollWheelHandler>
  );
};

export default BurstPieChart;
