// ── Import/Export payload ────────────────────────────────────────────────────
//
// A Tower's node graph is cyclic — `parent` and `prev` point back at the node that owns them — so a
// live tower cannot go through `JSON.stringify`. The exported form keeps only the downward pointers
// and replaces every node reference with the referenced brick's id, flattening the graph into a
// dictionary the importer walks to rebuild it.
//
// Measured state is deliberately absent: `widgetDims`, `argDims`, `nestingDims` and each brick's
// position are recomputed by `useTowerLayout` once the imported bricks mount.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { WidgetDisplay, WidgetInput } from './brick.types';
import type { Point } from './common.types';

/**
 * A whole workspace, ready for `JSON.stringify`.
 */
export interface ExportedProject {
    /** Schema version of this payload; see `EXPORT_SCHEMA_VERSION` in `utils/import-export`. */
    version: number;
    /** One entry per tower in the workspace. */
    towers: ExportedTower[];
    /** Every exported brick across every tower, keyed by brick id. */
    nodes: Record<string, ExportedNode>;
}

/**
 * A tower's own state — its placement and where its node graph starts.
 */
export interface ExportedTower {
    /** Unique identifier of the tower instance. */
    id: string;
    /** Absolute position of the tower in the workspace. */
    position: Point;
    /** Id of the brick at the root of this tower's graph; a key into `ExportedProject.nodes`. */
    rootNodeId: string;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Brick config common to every kind. Each `modelConfig` below carries exactly what the matching
 * brick model constructor needs, minus `id` (held on the node) and the measured dimensions.
 */
interface ExportedBrickConfigBase {
    /** Colors used in the default render state. */
    colorsDefault: { background: string; foreground: string; border: string };
    /** Tooltip text displayed on hover. */
    tooltipText: string;
    /** Controls brick size and font scaling. */
    scaleLevel: 1 | 2 | 3;
}

/** Config of a value brick; its widget may be interactive, so it carries user-entered values. */
interface ExportedValueConfig extends ExportedBrickConfigBase {
    widget: WidgetDisplay | WidgetInput;
}

/** Config of an expression brick. */
interface ExportedExpressionConfig extends ExportedBrickConfigBase {
    widget: WidgetDisplay;
    /**
     * Param labels, one per argument slot in declaration order.
     * An expression always declares at least one; the importer must check that before casting to
     * the model's non-empty tuple, since parsed JSON carries no such guarantee.
     */
    params: (string | null)[];
}

/** Config of a statement brick. */
interface ExportedStatementConfig extends ExportedBrickConfigBase {
    widget: WidgetDisplay;
    /** Param labels, one per argument slot in declaration order. */
    params: (string | null)[];
    /** Whether the brick structurally has a nesting cavity. */
    hasNesting: boolean;
    /** Whether the user has collapsed the nesting cavity. */
    isNestingFolded: boolean;
    /**
     * Whether the brick may connect to a preceding brick. This is the brick's capability, not a
     * record of what it is currently joined to — a hat brick such as `start` reports false while
     * still sitting at the head of a chain — so it cannot be derived from `next`/`prev` on import.
     */
    hasConnectionPrev: boolean;
    /** Whether the brick may connect to a following brick; see `hasConnectionPrev`. */
    hasConnectionNext: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

/** An exported value brick. Values are terminal: they own no downward pointers. */
export interface ExportedValueNode {
    kind: 'value';
    /** Id of the brick; the key this node sits under in `ExportedProject.nodes`. */
    id: string;
    modelConfig: ExportedValueConfig;
}

/** An exported expression brick. */
export interface ExportedExpressionNode {
    kind: 'expression';
    id: string;
    modelConfig: ExportedExpressionConfig;
    /** One entry per argument slot in declaration order; the child's id, or null if empty. */
    args: (string | null)[];
}

/** An exported statement brick. */
export interface ExportedStatementNode {
    kind: 'statement';
    id: string;
    modelConfig: ExportedStatementConfig;
    /** One entry per argument slot in declaration order; the child's id, or null if empty. */
    args: (string | null)[];
    /** Id of the next brick in the sequence; null if this is the last. */
    next: string | null;
    /**
     * Id of the first brick in this brick's cavity; null when the cavity is empty, and absent
     * when the brick has no cavity — mirroring `nestedNext` on `TowerStatementNode`.
     */
    nestedNext?: string | null;
}

/** Discriminated union over all exported brick kinds; narrow via `kind`. */
export type ExportedNode = ExportedValueNode | ExportedExpressionNode | ExportedStatementNode;

// ── Import ───────────────────────────────────────────────────────────────────

/**
 * How an import decides the ids its rebuilt bricks and towers will carry.
 *
 * `remint` is what the workspace uses: ids in a payload are references within the file, and the
 * workspace needs its own unique ones — `Workspace` keys its layout engines by tower id and its
 * brick views by brick id, so reusing either lets React reconcile a live component onto a new
 * model. `preserve` keeps the payload's ids, which is what makes an export → import → export
 * round trip comparable field for field; it is only safe when nothing else occupies the workspace.
 *
 * A future merge mode is a third strategy here, and needs no change to the graph reconstruction.
 */
export type ImportIdStrategy = 'preserve' | 'remint';

/** Payload id → workspace id, resolved before any model is constructed. */
export interface ImportIdMap {
    /** Brick ids, keyed by the id the payload used. */
    nodes: Map<string, string>;
    /** Tower ids, keyed by the id the payload used. */
    towers: Map<string, string>;
}
