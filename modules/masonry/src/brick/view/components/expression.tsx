import React from 'react';
import type { TBrickRenderPropsExpression } from '../../../@types/brick';
import { BrickWrapper } from './BrickWrapper';
import type { TConnectionPoints } from '../utils/common';

type PropsWithMetrics = TBrickRenderPropsExpression & {
  RenderMetrics?: (bbox: { w: number; h: number }, connectionPoints: TConnectionPoints) => void;
  standaloneSvg?: boolean;
};

export const ExpressionBrickView: React.FC<PropsWithMetrics> = (props) => {
  const { value, isValueSelectOpen, strokeWidth, scale, bboxArgs, standaloneSvg, ...commonProps } =
    props;

  const getBrickConfig = (bBoxLabel: { w: number; h: number }) => ({
    type: 'type2' as const,
    strokeWidth,
    scaleFactor: scale,
    bBoxLabel,
    bBoxArgs: bboxArgs,
  });

  return (
    <BrickWrapper
      {...commonProps}
      strokeWidth={strokeWidth}
      scale={scale}
      bboxArgs={bboxArgs}
      getBrickConfig={getBrickConfig}
      standaloneSvg={standaloneSvg}
    >
      {/* Expression-specific content */}
      {value !== undefined && (
        <text
          x={strokeWidth + 60}
          y={16 * 0.8 + strokeWidth / 2}
          fill="rgba(0,0,0,0.6)"
          fontSize={12}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {String(value)}
        </text>
      )}
      {isValueSelectOpen && (
        <circle cx={strokeWidth + 80} cy={10} r={3} fill="orange" opacity={0.8} />
      )}
    </BrickWrapper>
  );
};
