// ── Tower Node Types ───────────────────────────────────────────────────────────
//
// A Tower is a connected graph of bricks. Each node in the graph holds a
// pointer config that describes how it links to neighbouring nodes.
//
// Pointer configs are shaped by brick kind (value | expression | statement) and,
// for statement bricks, by whether a nesting cavity is present.
//
// All pointer fields hold direct references to the connected TowerNode.
// model objects, or null when the slot is unoccupied.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ValueBrickModel, ExpressionBrickModel, StatementBrickModel } from '../models/brick';

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
export interface TowerValueNode {
    kind: 'value';
    model: ValueBrickModel;
    /** The node whose argument slot this value brick is plugged into; null if free-floating. */
    parent: TowerNode | null;
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
export interface TowerExpressionNode {
    kind: 'expression';
    model: ExpressionBrickModel;
    /** The node whose argument slot this expression brick is plugged into; null if free-floating. */
    parent: TowerNode | null;
    /**
     * One entry per argument slot in declaration order.
     * Each entry is the direct reference of the child node occupying that slot, or null if empty.
     */
    args: (TowerNode | null)[];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pointer config for a **statement** brick node.
 *
 * ```
 * // statement
 * - a prev pointer
 * - a next pointer
 * - a list of arg pointers
 * - (optional) a nested next pointer if the brick has a cavity
 * ```
 *
 * Participates in a linear sequence: connected to the brick above (prev) and
 * the brick below (next), with zero or more argument slots on the side.
 * If the brick has a nesting cavity, `nestedNext` points to the inner sequence.
 */
export interface TowerStatementNode {
    kind: 'statement';
    model: StatementBrickModel;
    /** The node immediately preceding this one in the sequence; null if this is the first. */
    prev: TowerNode | null;
    /** The node immediately following this one in the sequence; null if this is the last. */
    next: TowerNode | null;
    /**
     * One entry per argument slot in declaration order.
     * Each entry is the direct reference of the child node occupying that slot, or null if empty.
     */
    args: (TowerNode | null)[];
    /**
     * The first node in the nested (inner) sequence housed inside this brick's cavity.
     * null when the cavity is empty, or undefined if the brick has no nesting cavity.
     */
    nestedNext?: TowerNode | null;
}

export type TowerNode = TowerValueNode | TowerExpressionNode | TowerStatementNode;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for rendering a Brick Tower view.
 * Rather than passing individual bricks, components take the root node directly;
 * the rest of the tree is reachable by traversal from there.
 */
export interface TowerViewProps {
    /** The root node of the tower tree. */
    root: TowerNode;
    /** If true, renders bricks directly without a wrapping container; defaults to false. */
    asChild?: boolean;
}
