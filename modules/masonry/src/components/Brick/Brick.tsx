import type { BrickViewPropsWithModel, WidgetInput } from '@/@types/brick.types';

import { BrickViewFixed } from './BrickFixed';
import { BrickViewInput, type BrickViewInputPropsWithModel } from './BrickInput';

const INPUT_WIDGET_TYPES: ReadonlySet<WidgetInput['type']> = new Set([
  'textbox',
  'numberbox',
  'toggle',
  'slider',
  'select',
]);

/**
 * Top-level brick component — renders the graphical shape, layout, and widgets for a single brick
 * in the visual programming environment.
 *
 * The model is the single source of truth. Routes to `BrickViewInput` for value bricks with
 * interactive widgets; `BrickViewFixed` for everything else.
 */
export function BrickView(props: BrickViewPropsWithModel) {
  if (
    props.kind === 'value' &&
    INPUT_WIDGET_TYPES.has(props.model.widget.type as WidgetInput['type'])
  ) {
    return <BrickViewInput {...(props as BrickViewInputPropsWithModel)} />;
  }
  return <BrickViewFixed {...props} />;
}
