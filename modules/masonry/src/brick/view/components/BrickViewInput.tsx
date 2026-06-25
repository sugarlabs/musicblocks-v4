import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Bounds, Size, ValueBrickViewProps } from '@/@types/brick';
import { SCALE_LEVEL_CONFIG } from '../../utils/constants';
import { createBrickOutlineGenerator } from '../../utils/path2';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select2';
import { Input } from '../../../ui/input';
import { Switch } from '../../../ui/switch';
import { Slider } from '../../../ui/slider';

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
      className="overflow-visible"
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
          className="flex items-center justify-center"
          style={{
            width: labelBounds.w,
            height: labelBounds.h,
          }}
        >
          <div ref={inputRef} className="flex w-max shrink-0 items-center px-2">
            {renderWidget(
              props.widget,
              fontSize,
              lineHeight,
              props.colorsDefault.foreground,
              props.colorsDefault.border,
              props.colorsDefault.background,
            )}
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}

function renderWidget(
  widget: WidgetInput,
  fontSize: number,
  lineHeight: number,
  color: string,
  borderColor: string,
  backgroundColor: string,
) {
  const commonStyle: React.CSSProperties = {
    fontSize,
    lineHeight: `${lineHeight}px`,
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
        <Select key={key} defaultValue={String(widget.value)}>
          <SelectTrigger
            className="h-7 min-w-[4rem] gap-1 border-black/20 bg-transparent px-2 py-1 transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5"
            style={commonStyle}
          >
            <div className="grid">
              <span className="col-start-1 row-start-1 invisible w-max pointer-events-none" aria-hidden="true">
                {widget.options.reduce((a, b) => (String(a).length > String(b).length ? String(a) : String(b)), '')}
              </span>
              <span className="col-start-1 row-start-1 flex items-center justify-start min-w-0">
                <SelectValue />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} className="min-w-0" style={{ backgroundColor, color, borderColor }}>
            {widget.options.map((opt) => (
              <SelectItem
                key={opt}
                value={String(opt)}
                className="focus:bg-black/10 focus:text-inherit dark:focus:bg-white/10"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'textbox':
      return (
        <Input
          key={key}
          type="text"
          defaultValue={widget.value as string}
          maxLength={widget.maxLength}
          className="h-7 border-black/20 bg-transparent px-2 py-1 transition-colors hover:bg-black/5 focus-visible:ring-1 focus-visible:ring-black/20 dark:border-white/20 dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
          style={{ ...commonStyle, width: `${Math.max(4, String(widget.value).length + 2)}ch` }}
        />
      );
    case 'numberbox':
      return (
        <Input
          key={key}
          type="number"
          defaultValue={widget.value as number}
          min={widget.min}
          max={widget.max}
          step={widget.step}
          className="h-7 border-black/20 bg-transparent px-2 py-1 transition-colors hover:bg-black/5 focus-visible:ring-1 focus-visible:ring-black/20 dark:border-white/20 dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
          style={
            {
              ...commonStyle,
              'width': '80px',
              '--widget-color': borderColor,
            } as React.CSSProperties
          }
        />
      );
    case 'toggle':
      return (
        <label key={key} className="flex cursor-pointer items-center gap-2" style={commonStyle}>
          <Switch
            defaultChecked={widget.value as boolean}
            style={{ '--widget-color': borderColor } as React.CSSProperties}
          />
          {widget.labels && (
            <span className="select-none">
              {widget.value ? widget.labels.on : widget.labels.off}
            </span>
          )}
        </label>
      );
    case 'slider':
      return (
        <div className="flex h-4 w-24 cursor-pointer items-center">
          <Slider
            key={key}
            defaultValue={[Number(widget.value) || 0]}
            min={widget.min}
            max={widget.max}
            step={widget.step}
            orientation="horizontal"
            style={{ '--widget-color': borderColor } as React.CSSProperties}
          />
        </div>
      );
    default:
      return null;
  }
}
