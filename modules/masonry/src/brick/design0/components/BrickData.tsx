import React from 'react';
import type { TBrickRenderPropsData, TCoords } from '@/@types/brick';

interface BrickDataProps {
  instance: TBrickRenderPropsData;
  coords?: TCoords;
}

const BrickData: React.FC<BrickDataProps> = ({ instance, coords = { x: 0, y: 0 } }) => {
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
      {instance.glyph && (
        <text
          x={50}
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

export default BrickData;
