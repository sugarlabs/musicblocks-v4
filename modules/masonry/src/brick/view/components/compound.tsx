import React, { useState, useEffect } from 'react';
import type { TBrickRenderPropsCompound } from '../../@types/brick';
import { generatePath, getBoundingBox } from '../../utils/path';

const FONT_HEIGHT = 16;

const PADDING = {
  top: 4,
  right: 8,
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

export const CompoundBrickView: React.FC<TBrickRenderPropsCompound> = (props) => {
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
    bboxNest,
    isFolded,
  } = props;

  const { w: labelW, h: labelH, ascent } = measureLabel(label, FONT_HEIGHT);
  const bBoxLabel = { w: labelW, h: labelH };
  const bBoxNesting = bboxNest;

  const [shape, setShape] = useState<{ path: string; w: number; h: number }>(() => {
    const cfg = {
      type: 'type3' as const,
      strokeWidth,
      scaleFactor: scale,
      bBoxLabel,
      bBoxArgs: bboxArgs,
      hasNotchAbove: topNotch,
      hasNotchBelow: bottomNotch,
      bBoxNesting,
      secondaryLabel: !isFolded,
    };
    const { path } = generatePath(cfg);
    const { w, h } = getBoundingBox(cfg);
    return { path, w, h };
  });

  useEffect(() => {
    const cfg = {
      type: 'type3' as const,
      strokeWidth,
      scaleFactor: scale,
      bBoxLabel,
      bBoxArgs: bboxArgs,
      hasNotchAbove: topNotch,
      hasNotchBelow: bottomNotch,
      bBoxNesting,
      secondaryLabel: !isFolded,
    };
    const { path } = generatePath(cfg);
    const { w, h } = getBoundingBox(cfg);
    setShape({ path, w, h });
  }, [label, strokeWidth, scale, bboxArgs, topNotch, bottomNotch, bboxNest, isFolded]);

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
        {/* Brick outline */}
        <path
          d={shape.path}
          fill={toCssColor(colorBg)}
          stroke={toCssColor(strokeColor)}
          strokeWidth={strokeWidth}
          filter={shadow ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' : undefined}
        />

        {/* Text label */}
        {labelType === 'text' && (
          <text
            x={strokeWidth + 4}
            y={ascent + strokeWidth / 2}
            fill={toCssColor(colorFg)}
            fontSize={FONT_HEIGHT}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {label}
          </text>
        )}

        {/* Tooltip */}
        {tooltip && <title>{tooltip}</title>}
      </g>
    </svg>
  );
};
