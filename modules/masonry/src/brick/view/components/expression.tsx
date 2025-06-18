import React from 'react';
import ExpressionBrick from '../../model/expression';
import type { IBrickExpression, TColor, TExtent, TVisualState } from '../../@types/brick';

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
  shadow?: boolean;
  scale?: number;
  tooltip?: string;
  value?: boolean | number | string;
  isValueSelectOpen?: boolean;
  bboxArgs: TExtent[];
  x?: number;
  y?: number;
  visualState?: TVisualState;
  isActionMenuOpen?: boolean;
  isVisible?: boolean;
  onClick?: () => void;
}

export default function ExpressionBrickView({
  uuid,
  name,
  label,
  labelType,
  colorBg,
  colorFg,
  strokeColor,
  shadow = false,
  scale = 1,
  tooltip,
  value,
  isValueSelectOpen = false,
  bboxArgs,
  x = 0,
  y = 0,
  visualState = 'default',
  isActionMenuOpen = false,
  isVisible = true,
  onClick,
}: Props) {
  const brick = React.useMemo(() => {
    const b = new ExpressionBrick({
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
      value,
      isValueSelectOpen,
      bboxArgs,
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
    value,
    isValueSelectOpen,
    bboxArgs,
    visualState,
    isActionMenuOpen,
    isVisible,
  ]);

  const p = brick.renderProps;
  if (!p.isVisible) return null;

  const ov = STYLE_OVERRIDES[p.visualState] || {};
  const final = {
    ...p,
    fill: ov.fill ?? (p.colorBg as string),
    stroke: ov.stroke ?? (p.strokeColor as string),
    strokeWidth: ov.strokeWidth ?? p.strokeWidth,
    filter: ov.filter,
    animation: ov.animation,
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
        style={{ cursor: onClick ? 'pointer' : 'default', animation: final.animation }}
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
        {p.isValueSelectOpen && (
          <polygon
            points={`${brick.boundingBox.w - 12},4 ${brick.boundingBox.w - 4},4 ${brick.boundingBox.w - 8},10`}
            fill={toCssColor(colorFg)}
          />
        )}
      </g>
    </svg>
  );
}
