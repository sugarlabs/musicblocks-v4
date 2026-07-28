import type { Point } from '@/@types/common.types';

import type { ArgumentConnection } from '@/utils/argument-connect';
import type { StatementConnection } from '@/utils/statement-connect';
import { useWorkspaceStore } from '@/stores/workspace';
import { useBrickLayoutStore } from '@/stores/brick';
import { resolveArgumentConnection } from '@/utils/argument-connect';
import { resolveStatementConnection } from '@/utils/statement-connect';
import { ActiveTargetMeta } from '@/stores/connection-preview';

import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

export function computeStatementPreview(
    connection: StatementConnection,
    store: ReturnType<typeof useWorkspaceStore.getState>,
): { isValid: boolean; snapPosition: Point } {
    const hostTower = store.towers[connection.hostTowerId];
    if (!hostTower) return { isValid: false, snapPosition: { x: 0, y: 0 } };

    const hostCoords = useBrickLayoutStore.getState().coords[connection.parent.model.id] || {
        x: 0,
        y: 0,
    };

    const hostScale = SCALE_LEVEL_CONFIG[connection.parent.model.scaleLevel].brickScale;
    const hostBounds = connection.parent.model.getConnectorCoords()[connection.socket];
    const hx = hostCoords.x + (hostBounds ? hostBounds.x * hostScale : 0);
    const hy = hostCoords.y + (hostBounds ? hostBounds.y * hostScale : 0);

    const draggedScale = SCALE_LEVEL_CONFIG[connection.child.model.scaleLevel].brickScale;
    const draggedBounds = connection.child.model.getConnectorCoords().prev;
    const dx = draggedBounds ? draggedBounds.x * draggedScale : 0;
    const dy = draggedBounds ? draggedBounds.y * draggedScale : 0;

    const strokeWidthOffset = 2 * hostScale; // STROKE_WIDTH = 2
    const snapX = hx - dx;
    // The layout engine makes strokes abut rather than overlap, which introduces a gap
    // equal to the stroke width between the mathematical notch centres.
    const snapY = hy - dy + strokeWidthOffset;

    return {
        isValid: true,
        snapPosition: { x: snapX, y: snapY },
    };
}

export function computeArgumentPreview(
    connection: ArgumentConnection,
    store: ReturnType<typeof useWorkspaceStore.getState>,
): { isValid: boolean; snapPosition: Point } {
    const hostTower = store.towers[connection.hostTowerId];
    if (!hostTower) return { isValid: false, snapPosition: { x: 0, y: 0 } };

    const hostCoords = useBrickLayoutStore.getState().coords[connection.parent.model.id] || {
        x: 0,
        y: 0,
    };

    const hostScale = SCALE_LEVEL_CONFIG[connection.parent.model.scaleLevel].brickScale;
    const hostBounds = connection.parent.model.getConnectorCoords().inputs[connection.slotIndex];
    const hx = hostCoords.x + (hostBounds ? hostBounds.x * hostScale : 0);
    const hy = hostCoords.y + (hostBounds ? hostBounds.y * hostScale : 0);

    const draggedScale = SCALE_LEVEL_CONFIG[connection.child.model.scaleLevel].brickScale;
    const draggedBounds = connection.child.model.getConnectorCoords().output;
    const dx = draggedBounds ? draggedBounds.x * draggedScale : 0;
    const dy = draggedBounds ? draggedBounds.y * draggedScale : 0;

    const strokeWidthOffset = 2 * hostScale; // STROKE_WIDTH = 2
    // Abut strokes horizontally
    const snapX = hx - dx + strokeWidthOffset;
    const snapY = hy - dy;

    return {
        isValid: true,
        snapPosition: { x: snapX, y: snapY },
    };
}

export function resolveCandidateConnection(
    draggedTowerId: string,
    store: ReturnType<typeof useWorkspaceStore.getState>,
): {
    target: ActiveTargetMeta;
    isValid: boolean;
    snapPosition: Point;
} | null {
    const argument = resolveArgumentConnection({
        draggedTowerId,
        space: store.argumentCollisionSpace,
        connectors: store.argumentConnectors,
        towers: store.towers,
    });

    const statement = resolveStatementConnection({
        draggedTowerId,
        space: store.statementCollisionSpace,
        connectors: store.statementConnectors,
        towers: store.towers,
    });

    if (statement !== null && (argument === null || statement.distance < argument.distance)) {
        const preview = computeStatementPreview(statement, store);
        const parentCoords = useBrickLayoutStore.getState().coords[statement.parent.model.id] || {
            x: 0,
            y: 0,
        };
        const bounds = statement.parent.model.getConnectorCoords()[statement.socket];

        const hostScale = SCALE_LEVEL_CONFIG[statement.parent.model.scaleLevel].brickScale;
        const cx = parentCoords.x + (bounds ? bounds.x * hostScale : 0);
        const cy = parentCoords.y + (bounds ? bounds.y * hostScale : 0);

        return {
            target: {
                draggedTowerId,
                targetTowerId: statement.hostTowerId,
                targetBrickId: statement.parent.model.id,
                type: 'statement',
                distance: statement.distance,
                centroid: { x: cx, y: cy },
            },
            ...preview,
        };
    }

    if (argument !== null) {
        const preview = computeArgumentPreview(argument, store);
        const parentCoords = useBrickLayoutStore.getState().coords[argument.parent.model.id] || {
            x: 0,
            y: 0,
        };
        const bounds = argument.parent.model.getConnectorCoords().inputs[argument.slotIndex];

        const hostScale = SCALE_LEVEL_CONFIG[argument.parent.model.scaleLevel].brickScale;
        const cx = parentCoords.x + (bounds ? bounds.x * hostScale : 0);
        const cy = parentCoords.y + (bounds ? bounds.y * hostScale : 0);

        return {
            target: {
                draggedTowerId,
                targetTowerId: argument.hostTowerId,
                targetBrickId: argument.parent.model.id,
                type: 'argument',
                distance: argument.distance,
                centroid: { x: cx, y: cy },
            },
            ...preview,
        };
    }

    return null;
}
