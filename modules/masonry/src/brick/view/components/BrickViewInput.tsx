import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Bounds, Size, ValueBrickViewProps } from '@/@types/brick';
import { SCALE_LEVEL_CONFIG } from '../../utils/constants';
import { createBrickOutlineGenerator } from '../../utils/path2';

type OmitTooltip<T> = Omit<T, 'tooltipText'>;

// Extract only the interactive input widgets from ValueBrickViewProps.
// This ensures BrickViewInput exclusively handles widgets like textboxes and toggles,
// offloading display-only widgets (like labels/graphics) to BrickViewFixed.
type WidgetInput = Extract<
  ValueBrickViewProps['widget'],
  { type: 'textbox' | 'numberbox' | 'toggle' | 'slider' | 'select' }
>;

export type BrickViewInputProps = OmitTooltip<Omit<ValueBrickViewProps, 'widget'>> & {
  widget: WidgetInput;
};

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;

export function BrickViewInput(props: BrickViewInputProps) {
  const { brickScale, minWidth, minArgNestHeight, minLabelParamHeight, fontSize, lineHeight } =
    SCALE_LEVEL_CONFIG[props.scaleLevel ?? DEFAULT_SCALE_LEVEL];

  const pxToSvg = useCallback((px: number) => px / brickScale, [brickScale]);
  const svgToPx = useCallback((u: number) => u * brickScale, [brickScale]);

  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  const inputRef = useRef<HTMLDivElement>(null);

  const generateOutline = useMemo(
    () =>
      createBrickOutlineGenerator({
        minWidth: pxToSvg(minWidth),
        minLabelHeight: pxToSvg(minLabelParamHeight),
        minNestHeight: pxToSvg(minArgNestHeight),
        minParamHeight: pxToSvg(minLabelParamHeight),
        minArgHeight: pxToSvg(minArgNestHeight),
      }),
    [minWidth, minLabelParamHeight, minArgNestHeight, pxToSvg],
  );

  // Layout Effect 1: Measures the actual rendered DOM dimensions of the input.
  // We use the inputRef to measure the physical pixel width of the rendered widget.
  // This must run first so we know exactly how large to draw the SVG brick path.
  useLayoutEffect(() => {
    if (inputRef.current) {
      const { width, height } = inputRef.current.getBoundingClientRect();
      if (width !== labelDims.w || height !== labelDims.h) {
        setLabelDims({ w: width, h: height });
      }
    }
  }, [props.widget, labelDims, fontSize, lineHeight]);

  // Layout Effect 2: Generates the SVG outline path based on the measured dimensions.
  // This runs after labelDims updates. It creates the path, and calculates
  // the exact coordinates (labelBounds) where the foreignObject should be placed.
  useLayoutEffect(() => {
    // Value bricks only have a left notch
    const {
      width,
      height,
      path: generatedPath,
      bounds,
    } = generateOutline({
      strokeWidth: pxToSvg(STROKE_WIDTH),
      labelDims: { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) },
      paramArgDims: [],
      hasTopNotch: false,
      hasBottomNotch: false,
      hasLeftNotch: true,
    });

    setPath(generatedPath);
    setDims({ w: width, h: height });

    setLabelBounds({
      x: svgToPx(bounds.label.x),
      y: svgToPx(bounds.label.y),
      w: svgToPx(bounds.label.w),
      h: svgToPx(bounds.label.h),
    });
  }, [labelDims, generateOutline, svgToPx, pxToSvg]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(dims.w)}
      height={svgToPx(dims.h)}
      style={{ overflow: 'visible' }}
    >
      <path
        d={path}
        transform={`scale(${brickScale})`}
        fill={props.colorsDefault.background}
        stroke={props.colorsDefault.border}
        strokeWidth={pxToSvg(STROKE_WIDTH)}
      />

      {/* foreignObject acts as a viewport embedding standard HTML inside the SVG */}
      <foreignObject
        x={labelBounds.x}
        y={labelBounds.y}
        // Initially labelBounds is 0. We use 9999 so the HTML container is unconstrained
        // on the first pass, allowing inputRef to measure its true, natural width.
        width={labelBounds.w || 9999}
        height={labelBounds.h || 9999}
      >
        <div
          style={{
            width: labelBounds.w,
            height: labelBounds.h,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            ref={inputRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 'max-content',
              // CRITICAL: flexShrink: 0 prevents the layout from getting stuck!
              // If we switch to a larger widget, the parent div (width: labelBounds.w)
              // is temporarily too small. flexShrink: 0 forces this div to overflow
              // instead of squishing, ensuring getBoundingClientRect measures the true width.
              flexShrink: 0,
              // Padding to give some space between the input and the brick border
              padding: '0 8px',
            }}
          >
            {renderWidget(props.widget, fontSize, lineHeight, props.colorsDefault.foreground)}
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}

function renderWidget(widget: WidgetInput, fontSize: number, lineHeight: number, color: string) {
  const commonStyle: React.CSSProperties = {
    fontSize,
    lineHeight: `${lineHeight}px`,
    margin: 0,
    fontFamily: 'sans-serif',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color,
  };

  // CRITICAL: We generate a unique key combining the widget type and its initial value.
  // When switching between stories in Storybook (e.g. Textbox -> Numberbox), Storybook
  // re-uses the component and just changes the props.
  // Without this key, React would reuse the uncontrolled `<input>` DOM element, and a string
  // typed into the textbox would break the numberbox because "Hello" is invalid in type="number".
  // Changing the key forces React to completely destroy the old input and mount a fresh one.
  const key = `${widget.type}-${String(widget.value)}`;

  switch (widget.type) {
    case 'select':
      return (
        <select key={key} style={{ ...commonStyle, cursor: 'pointer' }} defaultValue={widget.value}>
          {widget.options.map((opt) => (
            <option key={opt} value={opt} style={{ color: '#000', background: '#fff' }}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'textbox':
      return (
        <input
          key={key}
          type="text"
          defaultValue={widget.value}
          maxLength={widget.maxLength}
          style={{ ...commonStyle, width: `${Math.max(4, widget.value.length + 2)}ch` }}
        />
      );
    case 'numberbox':
      return (
        <input
          key={key}
          type="number"
          defaultValue={widget.value}
          min={widget.min}
          max={widget.max}
          step={widget.step}
          style={{ ...commonStyle, width: '80px' }}
        />
      );
    case 'toggle':
      return (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', color, ...commonStyle }}>
          <input type="checkbox" defaultChecked={widget.value as boolean} style={{ margin: 0 }} />
          {widget.labels && <span>{widget.value ? widget.labels.on : widget.labels.off}</span>}
        </label>
      );
    case 'slider':
      return (
        <input
          key={key}
          type="range"
          defaultValue={widget.value}
          min={widget.min}
          max={widget.max}
          step={widget.step}
          style={{ margin: 0, width: '100px' }}
        />
      );
    default:
      return null;
  }
}
