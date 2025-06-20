// src/masonry/view/SimpleBrickView.tsx

import React, { useState, useEffect } from 'react';
import type { TBrickRenderPropsSimple } from '../../@types/brick';
import { generatePath, getBoundingBox } from '../../utils/path';

const FONT_HEIGHT = 16;

// ←── Breath­ing-room padding ──────────────────────────────────
const PADDING = {
  top: 4, // px above the brick
  right: 8, // px to the right of the brick
  bottom: 4, // px below the brick
  left: 8, // px to the left of the brick
};
// ────────────────────────────────────────────────────────────

/** Convert our TColor into CSS */
function toCssColor(color: string | ['rgb' | 'hsl', number, number, number]) {
  if (typeof color === 'string') return color;
  const [mode, a, b, c] = color;
  return mode === 'rgb' ? `rgb(${a},${b},${c})` : `hsl(${a},${b}%,${c}%)`;
}

/** Measure real text width + height + ascent/descent */
function measureLabel(label: string, fontSize: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize}px sans-serif`;
  const m = ctx.measureText(label);
  const ascent = m.actualBoundingBoxAscent ?? fontSize * 0.8;
  const descent = m.actualBoundingBoxDescent ?? fontSize * 0.2;
  const height = ascent + descent;

  return {
    w: m.width + 8, // You can keep or remove this 8px buffer
    h: height,
    ascent,
    descent,
  };
}

export const SimpleBrickView: React.FC<TBrickRenderPropsSimple> = (props) => {
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
  } = props;

  // ─── Hooks must run unconditionally ────────────────────────────────────────────

  // label measurement (not a hook, so safe)
  const { w: labelW, h: labelH, ascent } = measureLabel(label, FONT_HEIGHT);
  const bBoxLabel = { w: labelW, h: labelH };

  // your shape state
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
    const { path } = generatePath(cfg);
    const { w, h } = getBoundingBox(cfg);
    return { path, w, h };
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
    const { path } = generatePath(cfg);
    const { w, h } = getBoundingBox(cfg);
    setShape({ path, w, h });
  }, [label, strokeWidth, scale, bboxArgs, topNotch, bottomNotch]);

  // ─── Only now do we bail out if invisible ─────────────────────────────────────

  if (!isVisible) return null;

  // ─── and then the rest of your render ──────────────────────────────────────────

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
            y={ascent + strokeWidth / 2}
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
