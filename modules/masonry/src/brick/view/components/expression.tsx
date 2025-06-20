// src/masonry/view/ExpressionBrickView.tsx

import React, { useState, useEffect } from 'react';
import type { TBrickRenderPropsExpression } from '../../@types/brick';
import { generatePath, getBoundingBox } from '../../utils/path';

const FONT_HEIGHT = 16;

// Breathing-room padding on each side
const PADDING = {
  top: 4,
  right: 8,
  bottom: 4,
  left: 8,
};

/** Convert our TColor into a CSS color string */
function toCssColor(color: string | ['rgb' | 'hsl', number, number, number]) {
  if (typeof color === 'string') return color;
  const [mode, a, b, c] = color;
  return mode === 'rgb' ? `rgb(${a},${b},${c})` : `hsl(${a},${b}%,${c}%)`;
}

/**
 * Measure a single-line label’s true pixel width, ascent & descent,
 * then return total height = ascent + descent, plus an 8px horizontal buffer.
 */
function measureLabel(label: string, fontSize: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize}px sans-serif`;

  const m = ctx.measureText(label);
  const ascent = m.actualBoundingBoxAscent ?? fontSize * 0.8;
  const descent = m.actualBoundingBoxDescent ?? fontSize * 0.2;

  return {
    w: m.width + 8,
    h: ascent + descent,
    ascent,
    descent,
  };
}

export const ExpressionBrickView: React.FC<TBrickRenderPropsExpression> = (props) => {
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
    // value, isValueSelectOpen, // if you need them later
  } = props;

  // ─── Hooks & measurements must run before any early return ─────────────────

  // 1️⃣ Measure the label
  const { w: labelW, h: labelH, ascent } = measureLabel(label, FONT_HEIGHT);
  const bBoxLabel = { w: labelW, h: labelH };

  // 2️⃣ State to hold SVG path + bounding-box
  const [shape, setShape] = useState<{ path: string; w: number; h: number }>(() => {
    const cfg = {
      type: 'type2' as const,
      strokeWidth,
      scaleFactor: scale,
      bBoxLabel,
      // match the key expected by path.ts
      bBoxArgs: bboxArgs,
    };
    const { path } = generatePath(cfg);
    const { w, h } = getBoundingBox(cfg);
    return { path, w, h };
  });

  useEffect(() => {
    const cfg = {
      type: 'type2' as const,
      strokeWidth,
      scaleFactor: scale,
      bBoxLabel,
      bBoxArgs: bboxArgs,
    };
    const { path } = generatePath(cfg);
    const { w, h } = getBoundingBox(cfg);
    setShape({ path, w, h });
  }, [label, strokeWidth, scale, bboxArgs]);

  // ─── Now it’s safe to bail out if invisible ────────────────────────────────
  if (!isVisible) return null;

  // ─── Compute SVG size including padding ────────────────────────────────────
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
        {/* Brick background outline */}
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
      </g>

      {/* Accessibility tooltip */}
      {tooltip && <title>{tooltip}</title>}
    </svg>
  );
};
