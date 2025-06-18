import React from 'react';
import CompoundBrick from '../../model/compound';
import type { TColor, TExtent, TVisualState } from '../../@types/brick';

function toCssColor(color: TColor): string {
  if (typeof color === 'string') return color;
  const [mode, a, b, c] = color;
  return mode === 'rgb' ? `rgb(${a},${b},${c})` : `hsl(${a},${b}%,${c}%)`;
}

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
  unconnected: {
    stroke: '#888',
    fill: '#DDD',
    filter: 'grayscale(80%)',
  },
  dragged: { filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' },
};

export interface CompoundBrickViewProps {
  uuid: string;
  name: string;
  label: string;
  labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
  colorBg: TColor;
  colorFg: TColor;
  strokeColor: TColor;
  shadow?: boolean;
  isHighlighted?: boolean;
  tooltip?: string;
  scale?: number;

  topNotch?: boolean;
  bottomNotch?: boolean;
  bboxArgs: TExtent[];
  bboxNest: TExtent[];

  visualState?: TVisualState;
  isActionMenuOpen?: boolean;
  isVisible?: boolean;
  isFolded?: boolean;

  x?: number;
  y?: number;
  onClick?: () => void;
}

export default function CompoundBrickView({
  uuid,
  name,
  label,
  labelType,
  colorBg,
  colorFg,
  strokeColor,
  shadow = false,
  isHighlighted = false,
  tooltip,
  scale = 1,

  topNotch = false,
  bottomNotch = false,
  bboxArgs,
  bboxNest,

  visualState = 'default',
  isActionMenuOpen = false,
  isVisible = true,
  isFolded = false,

  x = 0,
  y = 0,
  onClick,
}: CompoundBrickViewProps) {
  const brick = React.useMemo(() => {
    const b = new CompoundBrick({
      uuid,
      name,
      label,
      labelType,
      colorBg,
      colorFg,
      strokeColor,
      shadow,
      isHighlighted,
      tooltip,
      scale,
      topNotch,
      bottomNotch,
      bboxArgs,
      bboxNest,
    });

    b.visualState = visualState;
    b.isActionMenuOpen = isActionMenuOpen;
    b.isVisible = isVisible;
    b.isFolded = isFolded;

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
    isHighlighted,
    tooltip,
    scale,
    topNotch,
    bottomNotch,
    bboxArgs,
    bboxNest,
    visualState,
    isActionMenuOpen,
    isVisible,
    isFolded,
  ]);

  const p = brick.renderProps;
  if (!p.isVisible) return null;

  const ov = STYLE_OVERRIDES[p.visualState] || {};
  const final = {
    ...p,
    fill: ov.fill ?? toCssColor(p.colorBg),
    stroke: ov.stroke ?? toCssColor(p.strokeColor),
    strokeWidth: ov.strokeWidth ?? p.strokeWidth,
    filter: ov.filter,
    animation: ov.animation,
  };

  const { w, h } = brick.boundingBox;

  return (
    <svg
      width={w + 16}
      height={h + 16}
      viewBox={`-8 -8 ${w + 16} ${h + 16}`}
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

        {/* main body path */}
        <path
          d={final.path}
          fill={final.fill}
          stroke={final.stroke}
          strokeWidth={final.strokeWidth}
          style={{ filter: final.filter }}
        />

        {/* label in center */}
        {labelType === 'text' && (
          <text
            x={w / 2}
            y={h / 2}
            dominantBaseline="middle"
            textAnchor="middle"
            fill={toCssColor(colorFg)}
            fontSize={14}
          >
            {label}
          </text>
        )}
      </g>
    </svg>
  );
}
