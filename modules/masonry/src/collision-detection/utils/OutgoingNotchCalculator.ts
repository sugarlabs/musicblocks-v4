import type { NotchEntry } from '../types/Types';
import type { ITowerNode } from '../../tower/model/model';

/**
 * Compute *outgoing* notch coordinates for the brick you’re dragging.
 *
 * • Expression bricks “output” on their left edge (to mate with a right-side incoming).
 * • Simple Statement bricks output on their top edge.
 * • Compound Statement bricks output on their bottom edge.
 */
export function computeOutgoingNotches(
    brick: ITowerNode['brick'],
    pos: { x: number; y: number },
): NotchEntry[] {
    const { uuid, type, connectionPoints } = brick;
    const { x, y } = pos;
    const out: NotchEntry[] = [];

    if (type === 'Expression' && connectionPoints.left) {
        const cp = connectionPoints.left;
        out.push({
            x: x + cp.x,
            y: y + cp.y,
            notchId: `${uuid}::expr-left`,
            brickId: uuid,
            towerId: '',
            type: 'expression',
        });
    } else if (type === 'Simple' && connectionPoints.top) {
        const cp = connectionPoints.top;
        out.push({
            x: x + cp.x,
            y: y + cp.y,
            notchId: `${uuid}::stmt-top`,
            brickId: uuid,
            towerId: '',
            type: 'statement',
        });
    } else if (type === 'Compound' && connectionPoints.bottom) {
        const cp = connectionPoints.bottom;
        out.push({
            x: x + cp.x,
            y: y + cp.y,
            notchId: `${uuid}::stmt-bottom`,
            brickId: uuid,
            towerId: '',
            type: 'statement',
        });
    }

    return out;
}
