import React, { useState, useEffect, useMemo } from 'react';
import type { TBrickRenderPropsSimple } from '../../@types/brick';
import { generateBrickData } from '../../utils/path';

const FONT_HEIGHT = 16;

const PADDING = {
  top: 4,
  right: 10,
  bottom: 4,
  left: 8,
};

function toCssColor(color: string | ['rgb' | 'hsl', number, number, number]) {
  if (typeof color === 'string') return color;
  const [mode, a, b, c] = color;
  return mode === 'rgb' ? `rgb(${a},${b},${c})` : `hsl(${a},${b}%,${c}%)`;
}

function measureLabel(label: string, fontSize: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize}px sans-serif`;
  const m = ctx.measureText(label);
  const ascent = m.actualBoundingBoxAscent ?? fontSize * 0.8;
  const descent = m.actualBoundingBoxDescent ?? fontSize * 0.2;
  const height = ascent + descent;

  return {
    w: m.width + 8,
    h: height,
    ascent,
    descent,
  };
}

type TConnectionPoints = {
  top?: { x: number; y: number };
  right: { x: number; y: number }[];
  bottom?: { x: number; y: number };
  left?: { x: number; y: number };
};

type PropsWithMetrics = TBrickRenderPropsSimple & {
  RenderMetrics?: (bbox: { w: number; h: number }, connectionPoints: TConnectionPoints) => void;
};

export const SimpleBrickView: React.FC<PropsWithMetrics> = (props) => {
  const {
    label,
    labelType,
    colorBg,
    colorFg,
    strokeColor,
    strokeWidth,
    scale,
    shadow,
    tooltip,
    bboxArgs,
    visualState,
    isActionMenuOpen,
    isVisible,
    topNotch,
    bottomNotch,
    RenderMetrics,
  } = props;

  // Memoize bBoxLabel to prevent unnecessary recalculations
  const bBoxLabel = useMemo(() => {
    const { w: labelW, h: labelH } = measureLabel(label, FONT_HEIGHT);
    return { w: labelW, h: labelH };
  }, [label]);

  const [shape, setShape] = useState<{ path: string; w: number; h: number }>(() => {
    const cfg = {
      type: 'type1' as const,
      strokeWidth,
      scaleFactor: scale,
      bBoxLabel,
      bBoxArgs: bboxArgs,
      hasNotchAbove: topNotch,
      hasNotchBelow: bottomNotch,
    };
    const brickData = generateBrickData(cfg);
    return {
      path: brickData.path,
      w: brickData.boundingBox.w,
      h: brickData.boundingBox.h,
    };
  });

  useEffect(() => {
    const cfg = {
      type: 'type1' as const,
      strokeWidth,
      scaleFactor: scale,
      bBoxLabel,
      bBoxArgs: bboxArgs,
      hasNotchAbove: topNotch,
      hasNotchBelow: bottomNotch,
    };
    const brickData = generateBrickData(cfg);
    if (RenderMetrics) {
      RenderMetrics(brickData.boundingBox, brickData.connectionPoints);
    }
    setShape({ path: brickData.path, w: brickData.boundingBox.w, h: brickData.boundingBox.h });
  }, [label, strokeWidth, scale, bboxArgs, topNotch, bottomNotch, bBoxLabel]);

  if (!isVisible) return null;

  const svgWidth = shape.w + PADDING.left + PADDING.right;
  const svgHeight = shape.h + PADDING.top + PADDING.bottom;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      data-visual-state={visualState}
      data-action-menu-open={isActionMenuOpen}
      style={{ overflow: 'visible' }}
    >
      <g transform={`translate(${PADDING.left},${PADDING.top})`}>
        <path
          d={shape.path}
          fill={toCssColor(colorBg)}
          stroke={toCssColor(strokeColor)}
          strokeWidth={strokeWidth}
          filter={shadow ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' : undefined}
        />
        {labelType === 'text' && (
          <text
            x={strokeWidth + 4}
            y={bBoxLabel.h * 0.8 + strokeWidth / 2}
            fill={toCssColor(colorFg)}
            fontSize={FONT_HEIGHT}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {label}
          </text>
        )}
      </g>
      {tooltip && <title>{tooltip}</title>}
    </svg>
  );
};
