import {
    ExpressionBrickModel,
    StatementBrickModel,
    ValueBrickModel,
    type BrickModel,
} from '@/models/brick';
import { findNodeAndTower } from '@/stores/workspace';

/** Everything the help panel shows for a brick, captured when the help wedge runs. */
export interface BrickHelp {
    /** The panel's title: what the brick calls itself. */
    title: string;
    /** The brick's help text. */
    text: string;
    /** A standalone copy of the brick, drawn in the panel as its picture. */
    preview: BrickModel;
}

/**
 * What a brick calls itself, for the panel's title: its label, or the variant it is set to. A brick
 * with neither, such as a graphic or an input, has no words of its own to use.
 *
 * @param model - the brick to name
 * @returns the brick's name
 */
export function titleOf(model: BrickModel): string {
    const { widget } = model;

    switch (widget.type) {
        case 'label':
            return widget.text;
        case 'variant':
            return widget.value;
        default:
            return 'Help';
    }
}

/**
 * A standalone copy of a brick, to draw as its picture.
 *
 * A copy rather than the live model, because a brick view writes the dimensions it measures back
 * to its model: drawing the live one a second time would have the panel and the canvas fighting
 * over the same brick. Argument and cavity sizes are left out, so the copy shows empty slots
 * rather than stretching around bricks it does not hold.
 *
 * @param model - the brick to copy
 * @returns a fresh model of the same brick, with a new id
 */
export function previewModelOf(model: BrickModel): BrickModel {
    const config = {
        colorsDefault: { ...model.colorsDefault },
        tooltipText: model.tooltipText,
        scaleLevel: model.scaleLevel,
    };

    switch (model.kind) {
        case 'value':
            return new ValueBrickModel({ ...config, widget: structuredClone(model.widget) });
        case 'expression':
            return new ExpressionBrickModel({
                ...config,
                widget: structuredClone(model.widget),
                params: [...model.params] as [string | null, ...(string | null)[]],
            });
        case 'statement':
            return new StatementBrickModel({
                ...config,
                widget: structuredClone(model.widget),
                params: [...model.params],
                hasNesting: model.hasNesting,
                hasConnectionPrev: model.hasConnectionPrev,
                hasConnectionNext: model.hasConnectionNext,
            });
    }
}

/**
 * The help for a brick in the workspace, or null when there is none to give: the brick has left
 * the canvas, or carries no help text.
 *
 * Captured whole rather than looked up as the panel renders, so the panel stays as it was opened
 * even if the brick is then moved, edited or deleted.
 *
 * @param brickId - the brick the help wedge was used on
 * @returns the brick's help, or null
 */
export function brickHelpFor(brickId: string): BrickHelp | null {
    const found = findNodeAndTower(brickId);
    if (found === null || !found.node.model.tooltipText) return null;

    const { model } = found.node;

    return { title: titleOf(model), text: model.tooltipText, preview: previewModelOf(model) };
}
