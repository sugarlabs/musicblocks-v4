import React, { useState, useEffect, useMemo } from 'react';
import type { TBrickRenderProps } from '../../../@types/brick';
import { generateBrickData } from '../../utils/path';
import type { TInputUnion } from '../../utils/path';
import { measureLabel } from '../../utils/textMeasurement';
import { FONT_HEIGHT, PADDING, toCssColor, type TConnectionPoints } from '../utils/common';

export interface BrickWrapperProps extends TBrickRenderProps {
  /** Callback to receive metrics after calculation */
  RenderMetrics?: (bbox: { w: number; h: number }, connectionPoints: TConnectionPoints) => void;
  /** Children to render inside the brick */
  children?: React.ReactNode;
  /** Brick-specific configuration for path generation */
  getBrickConfig: (bBoxLabel: { w: number; h: number }) => TInputUnion;
  /** If true, render as standalone SVG (for palette); else as <g> (for workspace) */
  standaloneSvg?: boolean;
}

/**
 * Reusable wrapper component that handles common brick rendering logic
 * Used by SimpleBrickView, ExpressionBrickView, and CompoundBrickView
 */
export const BrickWrapper: React.FC<BrickWrapperProps> = ({
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
  RenderMetrics,
  children,
  getBrickConfig,
  standaloneSvg,
}) => {
  const bBoxLabel = useMemo(() => {
    const { w: labelW, h: labelH } = measureLabel(label, FONT_HEIGHT);
    return { w: labelW, h: labelH };
  }, [label]);

  const [shape, setShape] = useState<{ path: string; w: number; h: number }>(() => {
    const cfg = getBrickConfig(bBoxLabel);
    const brickData = generateBrickData(cfg);
    return {
      path: brickData.path,
      w: brickData.boundingBox.w,
      h: brickData.boundingBox.h,
    };
  });

  useEffect(() => {
    const cfg = getBrickConfig(bBoxLabel);
    const brickData = generateBrickData(cfg);

    if (RenderMetrics) {
      RenderMetrics(brickData.boundingBox, brickData.connectionPoints);
    }

    setShape({
      path: brickData.path,
      w: brickData.boundingBox.w,
      h: brickData.boundingBox.h,
    });
  }, [label, strokeWidth, scale, bboxArgs, bBoxLabel, RenderMetrics, getBrickConfig]);

  if (!isVisible) return null;

  // Calculate width and height for background rect and transforms
  const svgWidth = shape.w + PADDING.left + PADDING.right;
  const svgHeight = shape.h + PADDING.top + PADDING.bottom;

  if (standaloneSvg) {
    return (
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        data-visual-state={visualState}
        data-action-menu-open={isActionMenuOpen}
        style={{ overflow: 'visible' }}
      >
        {/* Background rectangle for brick visuals, if needed */}
        <rect
          x={0}
          y={0}
          width={svgWidth}
          height={svgHeight}
          fill="none"
          pointerEvents="none"
        />
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
          {children}
        </g>
        {tooltip && <title>{tooltip}</title>}
      </svg>
    );
  }

  return (
    <g
      data-visual-state={visualState}
      data-action-menu-open={isActionMenuOpen}
      style={{ overflow: 'visible' }}
    >
      {/* Background rectangle for brick visuals, if needed */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill="none"
        pointerEvents="none"
      />
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
        {children}
      </g>
      {tooltip && <title>{tooltip}</title>}
    </g>
  );
};
