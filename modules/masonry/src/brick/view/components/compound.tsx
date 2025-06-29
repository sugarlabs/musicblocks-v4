import React, { useState, useEffect, useMemo } from 'react';
import type { TBrickRenderPropsCompound } from '../../@types/brick';
import { generateBrickData } from '../../utils/path';

const FONT_HEIGHT = 16;
const PADDING = { top: 4, right: 8, bottom: 4, left: 8 };

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
  return { w: m.width + 8, h: ascent + descent, ascent, descent };
}

type TConnectionPoints = {
  top?: { x: number; y: number };
  right: { x: number; y: number }[];
  bottom?: { x: number; y: number };
  left?: { x: number; y: number };
};

type PropsWithMetrics = TBrickRenderPropsCompound & {
  RenderMetrics?: (bbox: { w: number; h: number }, connectionPoints: TConnectionPoints) => void;
};

export const CompoundBrickView: React.FC<PropsWithMetrics> = (props) => {
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
    bboxArgs: rawArgs,
    bboxNest: rawNest,
    visualState,
    isActionMenuOpen,
    isVisible,
    topNotch,
    bottomNotch,
    isFolded,
    RenderMetrics,
  } = props;

  const bboxArgs = rawArgs ?? [];
  const bBoxNesting = rawNest ?? [];

  const bBoxLabel = useMemo(() => {
    const { w: lw, h: lh } = measureLabel(label, FONT_HEIGHT);
    return { w: lw, h: lh };
  }, [label]);

  const [shape, setShape] = useState(() => {
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
    const d = generateBrickData(cfg);
    return { path: d.path, w: d.boundingBox.w, h: d.boundingBox.h };
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
    const d = generateBrickData(cfg);
    RenderMetrics?.(d.boundingBox, d.connectionPoints);
    setShape({ path: d.path, w: d.boundingBox.w, h: d.boundingBox.h });
  }, [label, strokeWidth, scale, rawArgs, rawNest, topNotch, bottomNotch, isFolded, bBoxLabel]);

  if (!isVisible) return null;

  const svgW = shape.w + PADDING.left + PADDING.right;
  const svgH = shape.h + PADDING.top + PADDING.bottom;

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
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
