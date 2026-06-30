import type { BrickViewProps, BrickViewPropsWithModel, WidgetInput } from '@/@types/brick.types';
import type { ValueBrickModel } from '@/models/brick';

import { BrickViewFixed, type BrickViewFixedProps } from './BrickFixed';
import { BrickViewFixedWithModel } from './BrickFixed';
import { BrickViewInput } from './BrickInput';
import { BrickViewInputWithModel } from './BrickInput';

const INPUT_WIDGET_TYPES: ReadonlySet<WidgetInput['type']> = new Set([
  'textbox',
  'numberbox',
  'toggle',
  'slider',
  'select',
]);

/**
 * Top-level brick component — renders the graphical shape, layout, and widgets for a single brick
 * in the visual programming environment. Routes to `BrickViewInput` for value bricks with
 * interactive widgets; `BrickViewFixed` for everything else.
 */
export function BrickView(props: BrickViewProps) {
  if (props.kind === 'value' && INPUT_WIDGET_TYPES.has(props.widget.type as WidgetInput['type'])) {
    return <BrickViewInput {...props} widget={props.widget as WidgetInput} />;
  }
  return <BrickViewFixed {...(props as BrickViewFixedProps)} />;
}

/**
 * Model-based top-level brick component. Mirrors `BrickView` but accepts a model instance
 * instead of a flat configuration object.
 *
 * Routes to `BrickViewInputWithModel` for value bricks whose model widget is an interactive
 * input control; `BrickViewFixedWithModel` for everything else.
 *
 * The existing `BrickView` component is completely unchanged.
 */
export function BrickViewWithModel(props: BrickViewPropsWithModel) {
  if (
    props.kind === 'value' &&
    INPUT_WIDGET_TYPES.has(props.model.widget.type as WidgetInput['type'])
  ) {
    return (
      <BrickViewInputWithModel
        kind="value"
        model={props.model as ValueBrickModel & { widget: WidgetInput }}
      />
    );
  }
  return <BrickViewFixedWithModel {...props} />;
}
