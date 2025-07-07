import React from 'react';
import type { TBrickRenderPropsCompound } from '../../../@types/brick';
import { BrickWrapper } from './BrickWrapper';
import type { TConnectionPoints } from '../utils/common';

type PropsWithMetrics = TBrickRenderPropsCompound & {
  RenderMetrics?: (bbox: { w: number; h: number }, connectionPoints: TConnectionPoints) => void;
};

export const CompoundBrickView: React.FC<PropsWithMetrics> = (props) => {
  const {
    topNotch,
    bottomNotch,
    isFolded,
    strokeWidth,
    scale,
    bboxArgs,
    bboxNest,
    ...commonProps
  } = props;

  const getBrickConfig = (bBoxLabel: { w: number; h: number }) => ({
    type: 'type3' as const,
    strokeWidth,
    scaleFactor: scale,
    bBoxLabel,
    bBoxArgs: bboxArgs,
    hasNotchAbove: topNotch,
    hasNotchBelow: bottomNotch,
    bBoxNesting: bboxNest,
    secondaryLabel: true,
  });

  return (
    <BrickWrapper
      {...commonProps}
      strokeWidth={strokeWidth}
      scale={scale}
      bboxArgs={bboxArgs}
      getBrickConfig={getBrickConfig}
    >
      {/* Compound-specific content */}
      {isFolded && (
        <text
          x={strokeWidth + 4}
          y={40}
          fill="rgba(0,0,0,0.5)"
          fontSize={10}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          [...]
        </text>
      )}
    </BrickWrapper>
  );
};
