import type { BrickViewProps, WidgetInput } from '@/@types/brick.types';

import { BrickViewFixed, type BrickViewFixedProps } from './BrickFixed';
import { BrickViewInput } from './BrickInput';

const INPUT_WIDGET_TYPES: ReadonlySet<WidgetInput['type']> = new Set([
  'textbox',
  'numberbox',
  'toggle',
  'slider',
  'select',
]);

export function BrickView(props: BrickViewProps) {
  if (props.kind === 'value' && INPUT_WIDGET_TYPES.has(props.widget.type as WidgetInput['type'])) {
    return <BrickViewInput {...props} widget={props.widget as WidgetInput} />;
  }
  return <BrickViewFixed {...(props as BrickViewFixedProps)} />;
}
