import { useMemo } from 'react';

import type { BrickViewProps, BrickViewPropsWithModel } from '@/@types/brick.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';
import { BrickView } from '@/components/Brick/Brick';
import {
  ExpressionBrickModel,
  StatementBrickModel,
  ValueBrickModel,
  type BrickModel,
} from '@/models/brick';

// -------------------------------------------------------------------------------------------------

function createPreviewModel(props: BrickViewProps, id: string): BrickModel {
  switch (props.kind) {
    case 'value':
      return new ValueBrickModel({
        id,
        colorsDefault: props.colorsDefault,
        tooltipText: props.tooltipText,
        scaleLevel: props.scaleLevel ?? 2,
        widget: props.widget,
      });
    case 'expression':
      return new ExpressionBrickModel({
        id,
        colorsDefault: props.colorsDefault,
        tooltipText: props.tooltipText,
        scaleLevel: props.scaleLevel ?? 2,
        widget: props.widget,
        params: props.paramArgs.map((p) => p.param ?? null) as [
          string | null,
          ...(string | null)[],
        ],
        argDims: props.paramArgs.map((p) => p.argDims),
      });
    case 'statement':
      return new StatementBrickModel({
        id,
        colorsDefault: props.colorsDefault,
        tooltipText: props.tooltipText,
        scaleLevel: props.scaleLevel ?? 2,
        widget: props.widget,
        params: props.paramArgs?.map((p) => p.param ?? null),
        argDims: props.paramArgs?.map((p) => p.argDims),
        hasNesting: props.nesting !== undefined,
        nestingDims: props.nesting?.dims,
        isNestingFolded: props.nesting?.isFolded,
        hasConnectionPrev: props.hasConnectionPrev,
        hasConnectionNext: props.hasConnectionNext,
      });
  }
}

interface BrickSlotProps {
  /**
   * The full palette brick config for this entry. The placeholder only reads `name`/`description`
   * today, but it receives the entire object so a later PR can turn this slot into a drag source
   * that carries the config as its payload — DnD-readiness — without changing the prop contract.
   */
  brick: PaletteBrickConfig;
}

/**
 * Render boundary for a single palette brick. Renders a live SVG brick preview using the config's
 * `brick` properties, wrapped in a drag source boundary.
 */
export function BrickSlot({ brick }: BrickSlotProps) {
  const model = useMemo(() => createPreviewModel(brick.brick, brick.id), [brick.brick, brick.id]);

  // Use a type assertion because the view expects BrickViewPropsWithModel, but BrickModel
  // guarantees the model fields match the expected discriminated kind.
  const viewProps = { kind: model.kind, model } as unknown as BrickViewPropsWithModel;

  return (
    <div
      title={brick.description}
      data-brick-id={brick.id}
      className="flex min-h-11 cursor-grab items-center px-1 py-1 transition-colors select-none hover:brightness-110"
    >
      <div className="pointer-events-none">
        <BrickView {...viewProps} />
      </div>
    </div>
  );
}

export default BrickSlot;
