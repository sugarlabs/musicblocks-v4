// src/brick/view/components/simple.tsx

import React from 'react';
import SimpleBrick from '../../model/simple';
import type { IBrickSimple, TColor, TExtent, TVisualState } from '../../@types/brick';

function toCssColor(color: TColor): string {
  if (typeof color === 'string') return color;
  const [mode, a, b, c] = color;
  return mode === 'rgb' ? `rgb(${a},${b},${c})` : `hsl(${a},${b}%,${c}%)`;
}

// Optional: apply visual state effects
const STYLE_OVERRIDES: Record<
  TVisualState,
  Partial<{
    fill: string;
    stroke: string;
    strokeWidth: number;
    filter: string;
    animation: string;
  }>
> = {
  default: {},
  hovered: { filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))' },
  selected: { stroke: '#50E3C2', fill: '#E6FFFA', strokeWidth: 2 },
  executing: { stroke: '#F8E71C', animation: 'pulse 1s infinite' },
  unconnected: { stroke: '#888', fill: '#DDD', filter: 'grayscale(80%)' },
  dragged: { filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' },
};

interface Props {
  uuid: string;
  name: string;
  label: string;
  labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
  colorBg: TColor;
  colorFg: TColor;
  strokeColor: TColor;
  shadow: boolean;
  scale: number;
  tooltip?: string;

  topNotch: boolean;
  bottomNotch: boolean;
  bboxArgs: TExtent[];

  visualState?: TVisualState;
  isActionMenuOpen?: boolean;
  isVisible?: boolean;

  x?: number;
  y?: number;
  onClick?: () => void;
}

export default function SimpleBrickView({
  uuid,
  name,
  label,
  labelType,
  colorBg,
  colorFg,
  strokeColor,
  shadow,
  scale,
  tooltip,
  topNotch,
  bottomNotch,
  bboxArgs,

  visualState = 'default',
  isActionMenuOpen = false,
  isVisible = true,

  x = 0,
  y = 0,
  onClick,
}: Props) {
  const brick = React.useMemo(() => {
    const b = new SimpleBrick({
      uuid,
      name,
      label,
      labelType,
      colorBg,
      colorFg,
      strokeColor,
      shadow,
      scale,
      tooltip,
      topNotch,
      bottomNotch,
      bboxArgs,
      isHighlighted: false, // pass if needed
    });

    b.visualState = visualState;
    b.isActionMenuOpen = isActionMenuOpen;
    b.isVisible = isVisible;

    return b;
  }, [
    uuid,
    name,
    label,
    labelType,
    colorBg,
    colorFg,
    strokeColor,
    shadow,
    scale,
    tooltip,
    topNotch,
    bottomNotch,
    bboxArgs,
    visualState,
    isActionMenuOpen,
    isVisible,
  ]);

  const p = brick.renderProps;
  if (!p.isVisible) return null;

  const styleOverrides = STYLE_OVERRIDES[p.visualState] ?? {};
  const final = {
    ...p,
    fill: styleOverrides.fill ?? toCssColor(p.colorBg),
    stroke: styleOverrides.stroke ?? toCssColor(p.strokeColor),
    strokeWidth: styleOverrides.strokeWidth ?? p.strokeWidth,
    filter: styleOverrides.filter,
    animation: styleOverrides.animation,
  };

  return (
    <svg
      width={brick.boundingBox.w + 16}
      height={brick.boundingBox.h + 16}
      viewBox={`-8 -8 ${brick.boundingBox.w + 16} ${brick.boundingBox.h + 16}`}
      style={{ overflow: 'visible', background: 'transparent' }}
    >
      <g
        transform={`translate(${x},${y}) scale(${scale})`}
        data-uuid={uuid}
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          animation: final.animation,
        }}
      >
        {tooltip && <title>{tooltip}</title>}

        <path
          d={final.path}
          fill={final.fill}
          stroke={final.stroke}
          strokeWidth={final.strokeWidth}
          style={{ filter: final.filter }}
        />

        {labelType === 'text' && (
          <text
            x={brick.boundingBox.w / 2}
            y={brick.boundingBox.h / 2}
            textAnchor="middle"
            fill={toCssColor(colorFg)}
            fontSize={12}
            style={{ dominantBaseline: 'central' }}
          >
            {label}
          </text>
        )}
      </g>
    </svg>
  );
}
