// ── Tower Node Config Types ───────────────────────────────────────────────────
//
// A Tower is a connected graph of bricks. Each node in the graph holds a
// pointer config that describes how it links to neighbouring nodes.
//
// Pointer configs are shaped by brick kind (value | expression | statement) and,
// for statement bricks, by whether a nesting cavity is present.
//
// All pointer fields hold direct references to the connected TowerNodeConfig.
// model objects, or null when the slot is unoccupied.
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pointer config for a **value** brick node.
 *
 * ```
 * // value
 * - a parent pointer
 * ```
 *
 * A value brick plugs into a single argument slot of a parent node.
 */
export interface TowerValueNodeConfig {
    kind: 'value';
    /** The node whose argument slot this value brick is plugged into; null if free-floating. */
    parent: TowerNodeConfig | null;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pointer config for an **expression** brick node.
 *
 * ```
 * // expression
 * - a parent pointer
 * - a list of arg pointers
 * ```
 *
 * An expression brick plugs into a parent and itself owns one or more argument
 * slots, each of which may hold a value or expression child.
 */
export interface TowerExpressionNodeConfig {
    kind: 'expression';
    /** The node whose argument slot this expression brick is plugged into; null if free-floating. */
    parent: TowerNodeConfig | null;
    /**
     * One entry per argument slot in declaration order.
     * Each entry is the direct reference of the child node occupying that slot, or null if empty.
     */
    args: (TowerNodeConfig | null)[];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pointer config for a **statement** brick node **without** a nesting cavity.
 *
 * ```
 * // statement without nesting
 * - a prev pointer
 * - a next pointer
 * - a list of arg pointers
 * ```
 *
 * Participates in a linear sequence: connected to the brick above (prev) and
 * the brick below (next), with zero or more argument slots on the side.
 */
export interface TowerStatementNodeConfig {
    kind: 'statement';
    hasNesting: false;
    /** The node immediately preceding this one in the sequence; null if this is the first. */
    prev: TowerNodeConfig | null;
    /** The node immediately following this one in the sequence; null if this is the last. */
    next: TowerNodeConfig | null;
    /**
     * One entry per argument slot in declaration order.
     * Each entry is the direct reference of the child node occupying that slot, or null if empty.
     */
    args: (TowerNodeConfig | null)[];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pointer config for a **statement** brick node **with** a nesting cavity.
 *
 * ```
 * // statement with nesting
 * - a prev pointer
 * - a next pointer
 * - a list of arg pointers
 * - a nested next pointer
 * ```
 *
 * In addition to the linear sequence pointers, the brick owns a nesting cavity
 * that may contain its own inner sequence of bricks.
 */
export interface TowerNestedStatementNodeConfig {
    kind: 'statement';
    hasNesting: true;
    /** The node immediately preceding this one in the sequence; null if this is the first. */
    prev: TowerNodeConfig | null;
    /** The node immediately following this one in the sequence; null if this is the last. */
    next: TowerNodeConfig | null;
    /**
     * One entry per argument slot in declaration order.
     * Each entry is the direct reference of the child node occupying that slot, or null if empty.
     */
    args: (TowerNodeConfig | null)[];
    /**
     * The first node in the nested (inner) sequence housed inside this brick's cavity;
     * null when the cavity is empty.
     */
    nestedNext: TowerNodeConfig | null;
}

export type TowerNodeConfig =
    | TowerValueNodeConfig
    | TowerExpressionNodeConfig
    | TowerStatementNodeConfig
    | TowerNestedStatementNodeConfig;
