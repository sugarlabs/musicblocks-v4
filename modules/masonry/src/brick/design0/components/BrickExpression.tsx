import React from 'react';
import type { TBrickRenderPropsExpression, TCoords } from '@/@types/brick';

interface BrickExpressionProps {
  instance: TBrickRenderPropsExpression;
  coords?: TCoords;
}

const BrickExpression: React.FC<BrickExpressionProps> = ({ instance, coords = { x: 0, y: 0 } }) => {
  return (
    <g transform={`translate(${coords.x},${coords.y}) scale(${instance.scale})`}>
      <path
        d={instance.path}
        fill={instance.colorBg as string}
        stroke={instance.outline as string}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <text
        x={10}
        y={20}
        fill={instance.colorFg as string}
        fontSize={14}
        fontFamily="Arial, sans-serif"
      >
        {instance.label}
      </text>
      {instance.labelArgs.map((argLabel, index) => (
        <text
          key={index}
          x={15}
          y={40 + index * 20}
          fill={instance.colorFg as string}
          fontSize={12}
          fontFamily="Arial, sans-serif"
        >
          {argLabel}
        </text>
      ))}
      {instance.glyph && (
        <text
          x={instance.boundingBoxArgs[0]?.width - 25 || 0}
          y={20}
          fill={instance.colorFg as string}
          fontSize={14}
          fontFamily="Arial, sans-serif"
        >
          {instance.glyph}
        </text>
      )}
    </g>
  );
};

export default BrickExpression;
