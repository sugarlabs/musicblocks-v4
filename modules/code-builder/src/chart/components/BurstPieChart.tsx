import React, { useState } from 'react';
import { BurstPieChartProps } from '@/@types/chart';
import { Cell, PieChart as PIE, Pie } from 'recharts';

const BurstPieChart: React.FC<BurstPieChartProps> = (props) => {
  const { config } = props;
  const [subDataOpen, setSubDataOpen] = useState(-1);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${config.data[index].name}`}
      </text>
    );
  };

  const renderCustomizedSubDataLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${config.data[subDataOpen].subData[index].name}`}
      </text>
    );
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
          startAngle={subDataOpen === 0 ? 0 : subDataOpen * 90}
          endAngle={subDataOpen === 0 ? 90 : subDataOpen * 90 + 90}
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
          {config.data[subDataOpen].subData.map((entry, index) => (
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
  );
};

export default BurstPieChart;
