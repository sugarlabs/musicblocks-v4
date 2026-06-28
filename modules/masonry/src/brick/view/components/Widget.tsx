import { useState } from 'react';
import type { WidgetInput } from '@/@types/brick';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select2';
import { Input } from '@/ui/input';
import { Slider } from '@/ui/slider';

export interface WidgetProps {
  widget: WidgetInput;
  fontSize: number;
  lineHeight: number;
  color: string;
  borderColor: string;
  backgroundColor: string;
}

export function Widget({
  widget,
  fontSize,
  lineHeight,
  color,
  borderColor,
  backgroundColor,
}: WidgetProps) {
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
            className="h-7 min-w-16 gap-1 border-black/20 bg-transparent px-2 py-1 transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5"
            style={commonStyle}
          >
            <div className="grid">
              <span
                className="pointer-events-none invisible col-start-1 row-start-1 w-max"
                aria-hidden="true"
              >
                {widget.options.reduce(
                  (a, b) => (String(a).length > String(b).length ? String(a) : String(b)),
                  '',
                )}
              </span>
              <span className="col-start-1 row-start-1 flex min-w-0 items-center justify-start">
                <SelectValue />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className="min-w-0"
            style={{ backgroundColor, color, borderColor }}
          >
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
      return <DynamicTextbox key={key} widget={widget} commonStyle={commonStyle} />;
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
        <label
          key={key}
          className="relative flex h-7 cursor-pointer items-center rounded-full p-0.5"
          style={{ ...commonStyle, backgroundColor: borderColor }}
        >
          <input
            type="checkbox"
            className="peer sr-only"
            defaultChecked={widget.value as boolean}
          />
          {/* Thumb background */}
          <div
            className="absolute top-0.5 left-0.5 h-6 w-[calc(50%-2px)] rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full"
            style={{ backgroundColor }}
          />

          <div className="relative z-10 flex w-full items-center">
            {widget.labels && (
              <span className="flex-1 px-3 text-center text-xs font-bold select-none">
                {widget.labels.off}
              </span>
            )}
            {widget.labels && (
              <span className="flex-1 px-3 text-center text-xs font-bold select-none">
                {widget.labels.on}
              </span>
            )}
          </div>
        </label>
      );
    case 'slider':
      return (
        <div
          className="flex h-6 min-w-32 cursor-pointer items-center gap-2 px-1"
          style={commonStyle}
        >
          <span className="text-xs font-medium opacity-80 select-none">{widget.min}</span>
          <div className="flex flex-1 items-center">
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
          <span className="text-xs font-medium opacity-80 select-none">{widget.max}</span>
        </div>
      );
    default:
      return null;
  }
}

function DynamicTextbox({
  widget,
  commonStyle,
}: {
  widget: Extract<WidgetInput, { type: 'textbox' }>;
  commonStyle: React.CSSProperties;
}) {
  const [val, setVal] = useState(String(widget.value));
  return (
    <Input
      type="text"
      defaultValue={widget.value as string}
      onChange={(e) => setVal(e.target.value)}
      maxLength={widget.maxLength}
      className="h-7 border-black/20 bg-transparent px-2 py-1 transition-colors hover:bg-black/5 focus-visible:ring-1 focus-visible:ring-black/20 dark:border-white/20 dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
      style={{ ...commonStyle, width: `${Math.max(4, val.length + 2)}ch` }}
    />
  );
}
