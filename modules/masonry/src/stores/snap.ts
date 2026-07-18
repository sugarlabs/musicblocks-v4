import {
    collectArgConnectors,
    collectConnectors,
    ORIGIN,
    type Connector,
} from '@/utils/connectors';
import { SnapEngine } from '@/utils/snap';

import { useBrickLayoutStore } from './brick';
import { useWorkspaceStore } from './workspace';

/**
 * Shared, non-React access point for a single {@link SnapEngine} instance.
 *
 * The interact.js drag handlers in `useBrickMove` run outside React, so — like the zustand stores
 * reached via `.getState()` — the engine is held as a module singleton rather than a hook. There is
 * one snap space for the whole workspace, (re)sized to the canvas on demand and rebuilt each drag.
 *
 * SINGLE-WORKSPACE ASSUMPTION: a second concurrent workspace would share and clobber this same
 * engine. Tests (or a torn-down workspace) should call {@link resetSnapEngine} for a clean slate.
 */

let engine: SnapEngine | null = null;
let engineWidth = 0;
let engineHeight = 0;

/**
 * Returns the shared snap engine, sized to the given canvas dimensions. Created lazily and
 * re-created whenever the canvas size changes so the collision space always spans the full canvas
 * (boxes outside `[0, width] × [0, height]` are dropped). Re-creating clears the target set, which
 * is fine — it is rebuilt each drag via {@link refreshSnapTargets}.
 */
export function getSnapEngine(width: number, height: number): SnapEngine {
    if (engine === null || width !== engineWidth || height !== engineHeight) {
        engine = new SnapEngine(width, height);
        engineWidth = width;
        engineHeight = height;
    }
    return engine;
}

/**
 * Rebuilds the shared engine's target set from every tower EXCEPT the dragged one (so a tower can
 * never snap to itself), using live coords from the brick layout store. Targets include both
 * statement-sequence and argument-slot connectors, open and occupied, so mid-chain insertion and
 * arg snapping are both reachable. No-ops if the engine does not exist yet.
 */
export function refreshSnapTargets(draggedTowerId: string): void {
    if (engine === null) return;

    const { towers } = useWorkspaceStore.getState();
    const { coords } = useBrickLayoutStore.getState();

    const targets: Connector[] = [];
    for (const tower of Object.values(towers)) {
        if (tower.id === draggedTowerId) continue;
        // Both snapping domains share one engine: statement-sequence connectors and argument-slot
        // connectors go into the same target set. isValidMate keeps the domains from cross-matching.
        targets.push(...collectConnectors(tower.root, ORIGIN, coords, tower.id));
        targets.push(...collectArgConnectors(tower.root, ORIGIN, coords, tower.id));
    }

    engine.setTargets(targets);
}

/**
 * Clears the shared snap engine singleton (engine, cached size, and target set). Intended for
 * teardown and tests, where the module-level singleton would otherwise leak state across cases and
 * remounts (see the single-workspace assumption above).
 */
export function resetSnapEngine(): void {
    engine = null;
    engineWidth = 0;
    engineHeight = 0;
}
