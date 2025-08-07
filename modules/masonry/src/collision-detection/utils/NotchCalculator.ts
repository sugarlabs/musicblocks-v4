import type { NotchEntry } from '../types/Types';
import type { ITowerNode } from '../../tower/model/model';

/**
 * Compute *incoming* notch coordinates for every brick type.
 *
 * - Expression bricks accept on their right edge.
 * - Simple Statement bricks accept on their bottom edge.
 * - Compound Statement bricks accept from *inside* their top slot.
 */
export function computeIncomingNotches(
    brick: ITowerNode['brick'],
    pos: { x: number; y: number },
): NotchEntry[] {
    const { uuid, type, connectionPoints } = brick;
    const { x, y } = pos;
    const out: NotchEntry[] = [];

    // simple-statement stacking slot
    if (type === 'Simple') {
        const cp = connectionPoints.bottom!;
        out.push({
            x: x + cp.x,
            y: y + cp.y,
            notchId: `${uuid}::stmt-bottom`,
            brickId: uuid,
            towerId: '',
            type: 'statement',
        });

        // compound-statement nesting slot
    } else if (type === 'Compound') {
        const cp = connectionPoints.nested!;
        out.push({
            x: x + cp.x,
            y: y + cp.y,
            notchId: `${uuid}::stmt-inner-top`,
            brickId: uuid,
            towerId: '',
            type: 'statement',
        });
    }

    // both kinds of statements expose an expr-in on their right
    if (type === 'Simple' || type === 'Compound') {
        const cp = connectionPoints.right!;
        out.push({
            x: x + cp.x,
            y: y + cp.y,
            notchId: `${uuid}::expr-in`,
            brickId: uuid,
            towerId: '',
            type: 'expression',
        });
    }

    return out;
}
