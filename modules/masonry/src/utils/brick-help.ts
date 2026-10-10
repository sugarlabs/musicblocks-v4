import type { Bounds } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';

import {
    ExpressionBrickModel,
    StatementBrickModel,
    ValueBrickModel,
    type BrickModel,
} from '@/models/brick';
import { findNodeAndTower } from '@/stores/workspace';
import { modelConfigOf } from '@/utils/brick-model-factory';

/** Everything the help panel shows for a brick, captured when the help wedge runs. */
export interface BrickHelp {
    /** The panel's title: what the brick calls itself. */
    title: string;
    /** The brick's help text. */
    text: string;
    /** A standalone copy of the brick, drawn in the panel as its picture. */
    preview: BrickModel;
    /**
     * Where the brick's head was on screen, in window coordinates, so the panel can open beside it
     * and point at it. Null when the brick could not be found on the page, and the panel centres.
     */
    anchor?: Bounds | null;
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
    // Built from the config alone, which leaves out `id` and every measured size, so the copy
    // gets a fresh id and its slots and cavity start out empty.
    switch (model.kind) {
        case 'value':
            return new ValueBrickModel(modelConfigOf(model));
        case 'expression': {
            const config = modelConfigOf(model);
            // Copied from a live expression, which always has at least one param.
            const params = config.params as [string | null, ...(string | null)[]];
            return new ExpressionBrickModel({ ...config, params });
        }
        case 'statement':
            return new StatementBrickModel(modelConfigOf(model));
    }
}

/**
 * The bricks a brick carries in its argument slots, and the ones they carry in theirs: everything
 * drawn on its head row, as against the bricks after it or in its cavity.
 *
 * @param node - the brick
 * @returns the ids of the brick and of every brick in its slots
 */
function idsOnHeadOf(node: TowerNode): Set<string> {
    const ids = new Set<string>();
    const stack: TowerNode[] = [node];

    while (stack.length > 0) {
        const current = stack.pop()!;
        ids.add(current.model.id);
        if (current.kind !== 'value') {
            for (const arg of current.args) if (arg !== null) stack.push(arg);
        }
    }

    return ids;
}

/**
 * Where a brick's head is on screen, in window coordinates: the row that names it, from its left
 * edge to the right edge of whatever it holds in its slots. Not its whole box, which on a nesting
 * brick runs down past its cavity; the pie menu centres on the same row.
 *
 * @param node - the brick to find
 * @returns the head's box on screen, or null when the brick is not on the page
 */
export function headOnScreenOf(node: TowerNode): Bounds | null {
    const ids = idsOnHeadOf(node);
    let brick: DOMRect | null = null;
    let right = -Infinity;

    for (const element of document.querySelectorAll<HTMLElement>('[data-tower-brick]')) {
        const id = element.dataset.id;
        if (id === undefined || !ids.has(id)) continue;

        const rect = element.getBoundingClientRect();
        if (id === node.model.id) brick = rect;
        right = Math.max(right, rect.right);
    }

    if (brick === null) return null;

    const { widget } = node.model.bounds;

    return { x: brick.left, y: brick.top + widget.y, w: right - brick.left, h: widget.h };
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

    return {
        title: titleOf(model),
        text: model.tooltipText,
        preview: previewModelOf(model),
        anchor: headOnScreenOf(found.node),
    };
}
