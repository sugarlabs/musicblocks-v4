import type { BrickViewProps } from '@/@types/brick.types';
import type {
    ExportedExpressionConfig,
    ExportedStatementConfig,
    ExportedValueConfig,
} from '@/@types/import-export.types';
import type { TowerNode } from '@/@types/tower.types';

import {
    ExpressionBrickModel,
    StatementBrickModel,
    ValueBrickModel,
    type BrickModel,
} from '@/models/brick';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a brick model from a flat brick render config — the shared config → model boundary for
 * palette previews, the drag ghost, and workspace drops. Pass `id` to keep a preview keyed to its
 * palette entry; omit it for a fresh unique id (drops must never collide in the layout store).
 * Defaults (e.g. `scaleLevel`) live in the model constructors, the single boundary owning them.
 */
export function createBrickModel(props: BrickViewProps, id?: string): BrickModel {
    switch (props.kind) {
        case 'value':
            return new ValueBrickModel({
                id,
                colorsDefault: props.colorsDefault,
                colorsHighlight: props.colorsHighlight,
                shadow: props.shadow,
                tooltipText: props.tooltipText,
                scaleLevel: props.scaleLevel,
                widget: props.widget,
            });
        case 'expression':
            return new ExpressionBrickModel({
                id,
                colorsDefault: props.colorsDefault,
                colorsHighlight: props.colorsHighlight,
                shadow: props.shadow,
                tooltipText: props.tooltipText,
                scaleLevel: props.scaleLevel,
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
                colorsHighlight: props.colorsHighlight,
                shadow: props.shadow,
                tooltipText: props.tooltipText,
                scaleLevel: props.scaleLevel,
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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * The config a brick model was built from, read back off the model: what its constructor needs to
 * build the same brick again, minus `id` and the measured dimensions. The one place that lists a
 * model's fields, so the export and the help panel's preview copy cannot drift apart when a field
 * is added. Widgets and params are copied rather than shared, since an input widget's `value` is
 * mutated in place as the user types.
 *
 * @param model - the brick to read
 * @returns its config, typed by its kind
 */
export function modelConfigOf(model: ValueBrickModel): ExportedValueConfig;
export function modelConfigOf(model: ExpressionBrickModel): ExportedExpressionConfig;
export function modelConfigOf(model: StatementBrickModel): ExportedStatementConfig;
export function modelConfigOf(
    model: BrickModel,
): ExportedValueConfig | ExportedExpressionConfig | ExportedStatementConfig;
export function modelConfigOf(
    model: BrickModel,
): ExportedValueConfig | ExportedExpressionConfig | ExportedStatementConfig {
    const base = {
        colorsDefault: { ...model.colorsDefault },
        ...(model.colorsHighlight ? { colorsHighlight: { ...model.colorsHighlight } } : {}),
        ...(model.shadow ? { shadow: { ...model.shadow, offset: { ...model.shadow.offset } } } : {}),
        tooltipText: model.tooltipText,
        scaleLevel: model.scaleLevel,
    };

    switch (model.kind) {
        case 'value':
            return { ...base, widget: structuredClone(model.widget) };
        case 'expression':
            return { ...base, widget: structuredClone(model.widget), params: [...model.params] };
        case 'statement':
            return {
                ...base,
                widget: structuredClone(model.widget),
                params: [...model.params],
                hasNesting: model.hasNesting,
                isNestingFolded: model.isNestingFolded,
                hasConnectionPrev: model.hasConnectionPrev,
                hasConnectionNext: model.hasConnectionNext,
            };
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps a free-standing brick model as the root node of a new tower tree, every neighbour pointer
 * unoccupied: no parent/prev/next, one empty arg slot per param, and a statement's nesting cavity
 * empty (`null`) when the brick has one, `undefined` when it does not.
 */
export function wrapAsRootNode(model: BrickModel): TowerNode {
    switch (model.kind) {
        case 'value':
            return { kind: 'value', model, parent: null };
        case 'expression':
            return {
                kind: 'expression',
                model,
                parent: null,
                args: model.params.map(() => null),
            };
        case 'statement':
            return {
                kind: 'statement',
                model,
                prev: null,
                next: null,
                args: model.params.map(() => null),
                nestedNext: model.hasNesting ? null : undefined,
            };
    }
}
