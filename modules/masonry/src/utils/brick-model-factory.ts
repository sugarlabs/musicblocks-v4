import type { BrickViewProps } from '@/@types/brick.types';
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
                tooltipText: props.tooltipText,
                scaleLevel: props.scaleLevel,
                widget: props.widget,
            });
        case 'expression':
            return new ExpressionBrickModel({
                id,
                colorsDefault: props.colorsDefault,
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
