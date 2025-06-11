import React from 'react';
import type { TBrickRenderPropsBlock } from '@/@types/brick';

const BrickBlock: React.FC<TBrickRenderPropsBlock> = ({
  path,
  label,
  labelArgs,
  colorBg,
  colorFg,
  outline,
  scale,
}) => {
  return (
    <g transform={`scale(${scale})`}>
      <path
        d={path}
        fill={colorBg as string}
        stroke={outline as string}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <text x={10} y={20} fill={colorFg as string} fontSize={14} fontFamily="Arial, sans-serif">
        {label}
      </text>
      {labelArgs.map((argLabel, index) => (
        <text
          key={index}
          x={15}
          y={40 + index * 20}
          fill={colorFg as string}
          fontSize={12}
          fontFamily="Arial, sans-serif"
        >
          {argLabel}
        </text>
      ))}
      {/* {glyph && (
        <text
          x={instance.boundingBoxArgs[0]?.width - 25 || 0}
          y={20}
          fill={instance.colorFg as string}
          fontSize={14}
          fontFamily="Arial, sans-serif"
        >
          {instance.glyph}
        </text>
      )} */}
    </g>
  );
};

export default BrickBlock;
