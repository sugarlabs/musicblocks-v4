import React from 'react';
import type { TBrickRenderPropsSimple } from '../../@types/brick';
import { BrickWrapper } from './BrickWrapper';
import type { TConnectionPoints } from '../utils/common';

type PropsWithMetrics = TBrickRenderPropsSimple & {
  RenderMetrics?: (bbox: { w: number; h: number }, connectionPoints: TConnectionPoints) => void;
};

export const SimpleBrickView: React.FC<PropsWithMetrics> = (props) => {
  const { topNotch, bottomNotch, strokeWidth, scale, bboxArgs, ...commonProps } = props;

  const getBrickConfig = (bBoxLabel: { w: number; h: number }) => ({
    type: 'type1' as const,
    strokeWidth,
    scaleFactor: scale,
    bBoxLabel,
    bBoxArgs: bboxArgs,
    hasNotchAbove: topNotch,
    hasNotchBelow: bottomNotch,
  });

  return (
    <BrickWrapper
      {...commonProps}
      strokeWidth={strokeWidth}
      scale={scale}
      bboxArgs={bboxArgs}
      getBrickConfig={getBrickConfig}
    />
  );
};
