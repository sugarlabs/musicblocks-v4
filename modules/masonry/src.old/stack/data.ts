/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    BrickModelData,
    BrickModelExpression,
    BrickModelStatement,
    BrickModelBlock,
} from '../brick/model';

/**
 * @interface IStackNode
 * Represents a node in the stack structure.
 */
export interface IStackNode {
    /** The brick model associated with this node */
    brick: BrickModelData | BrickModelExpression | BrickModelStatement | BrickModelBlock;
    /** Child nodes of this node */
    children: IStackNode[];
}

/**
 * @interface IStack
 * Represents the stack structure for managing bricks.
 */
export interface IStack {
    /** Unique identifier for the stack */
    id: string;
    /** Root nodes of the stack */
    rootNodes: IStackNode[];

    /**
     * Validates the entire stack structure.
     * @returns {boolean} True if the stack is valid, false otherwise.
     */
    validate(): boolean;

    /**
     * Adds a new node to the stack.
     * @param {IStackNode} node - The node to add.
     * @param {string} [parentId] - The ID of the parent node (optional).
     */
    addNode(node: IStackNode, parentId?: string): void;

    /**
     * Removes a node from the stack.
     * @param {string} id - The ID of the node to remove.
     */
    removeNode(id: string): void;

    /**
     * Moves a node to a new position in the stack.
     * @param {string} id - The ID of the node to move.
     * @param {string} newParentId - The ID of the new parent node.
     * @param {number} newIndex - The new index position under the parent.
     */
    moveNode(id: string, newParentId: string, newIndex: number): void;

    /**
     * Collapses a block node.
     * @param {string} id - The ID of the node to collapse.
     */
    collapse(id: string): void;

    /**
     * Expands a block node.
     * @param {string} id - The ID of the node to expand.
     */
    expand(id: string): void;

    /**
     * Gets all validation errors in the stack.
     * @returns {string[]} An array of error messages.
     */
    getValidationErrors(): string[];
}

/**
 * @class StackNode
 * Implements the IStackNode interface.
 */
class StackNode implements IStackNode {
    brick: BrickModelData | BrickModelExpression | BrickModelStatement | BrickModelBlock;
    children: IStackNode[];

    /**
     * Creates a new StackNode.
     * @param {BrickModelData | BrickModelExpression | BrickModelStatement | BrickModelBlock} brick - The brick model for this node.
     */
    constructor(
        brick: BrickModelData | BrickModelExpression | BrickModelStatement | BrickModelBlock,
    ) {
        this.brick = brick;
        this.children = [];
    }
}

/**
 * @class Stack
 * Implements the IStack interface.
 */
class Stack implements IStack {
    id: string;
    rootNodes: IStackNode[];
    private _validationDisabled = false;

    /**
     * Creates a new Stack.
     * @param {string} id - The unique identifier for this stack.
     */
    constructor(id: string) {
        this.id = id;
        this.rootNodes = [];
    }

    validate(): boolean {
        if (this._validationDisabled) return true;
        return this.getValidationErrors().length === 0;
    }

    addNode(node: IStackNode, parentId?: string): void {
        if (!parentId) {
            this.rootNodes.push(node);
        } else {
            const parent = this.findNode(parentId);
            if (
                parent &&
                (parent.brick instanceof BrickModelBlock ||
                    parent.brick instanceof BrickModelExpression)
            ) {
                parent.children.push(node);
                this.updateNestExtent(parent);
            } else {
                throw new Error('Parent node not found or cannot have children');
            }
        }
    }

    removeNode(id: string): void {
        const remove = (nodes: IStackNode[]): boolean => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].brick.uuid === id) {
                    nodes.splice(i, 1);
                    return true;
                }
                if (nodes[i].children.length > 0 && remove(nodes[i].children)) {
                    this.updateNestExtent(nodes[i]);
                    return true;
                }
            }
            return false;
        };
        remove(this.rootNodes);
    }

    moveNode(id: string, newParentId: string, newIndex: number): void {
        const node = this.findNode(id);
        if (!node) throw new Error('Node not found');

        this.removeNode(id);
        const newParent = this.findNode(newParentId);
        if (!newParent) throw new Error('New parent node not found');

        if (
            !(newParent.brick instanceof BrickModelBlock) &&
            !(newParent.brick instanceof BrickModelExpression)
        ) {
            throw new Error('New parent cannot have children');
        }

        newParent.children.splice(newIndex, 0, node);
        this.updateNestExtent(newParent);
    }

    collapse(id: string): void {
        const node = this.findNode(id);
        if (node && node.brick instanceof BrickModelBlock) {
            node.brick.collapsed = true;
            this.updateNestExtent(node);
        }
    }

    expand(id: string): void {
        const node = this.findNode(id);
        if (node && node.brick instanceof BrickModelBlock) {
            node.brick.collapsed = false;
            this.updateNestExtent(node);
        }
    }

    getValidationErrors(): string[] {
        const errors: string[] = [];
        const validateNode = (node: IStackNode) => {
            // Check connection compatibility
            if (
                node.brick instanceof BrickModelStatement ||
                node.brick instanceof BrickModelBlock
            ) {
                if (node.brick.connectAbove && !this.isValidConnection(node, 'above')) {
                    errors.push(`Invalid connection above for node ${node.brick.uuid}`);
                }
                if (node.brick.connectBelow && !this.isValidConnection(node, 'below')) {
                    errors.push(`Invalid connection below for node ${node.brick.uuid}`);
                }
            }

            // Check argument data type compatibility
            if (
                node.brick instanceof BrickModelExpression ||
                node.brick instanceof BrickModelStatement ||
                node.brick instanceof BrickModelBlock
            ) {
                for (const [argId, arg] of Object.entries(node.brick.args)) {
                    const childNode = node.children.find((child) => child.brick.uuid === argId);
                    if (childNode && 'dataType' in childNode.brick) {
                        if (childNode.brick.dataType !== arg.dataType && arg.dataType !== 'any') {
                            errors.push(
                                `Data type mismatch for argument ${argId} in node ${node.brick.uuid}`,
                            );
                        }
                    }
                }
            }

            // Recursively validate children
            node.children.forEach(validateNode);
        };

        this.rootNodes.forEach(validateNode);
        return errors;
    }

    /**
     * Disables validation for this stack.
     */
    disableValidation(): void {
        this._validationDisabled = true;
    }

    /**
     * Enables validation for this stack.
     */
    enableValidation(): void {
        this._validationDisabled = false;
    }

    /**
     * Finds a node in the stack by its ID.
     * @param {string} id - The ID of the node to find.
     * @returns {IStackNode | null} The found node or null if not found.
     */
    private findNode(id: string): IStackNode | null {
        const find = (nodes: IStackNode[]): IStackNode | null => {
            for (const node of nodes) {
                if (node.brick.uuid === id) return node;
                if (node.children.length > 0) {
                    const found = find(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return find(this.rootNodes);
    }

    /**
     * Updates the nest extent of a block node.
     * @param {IStackNode} node - The node to update.
     */
    private updateNestExtent(node: IStackNode): void {
        if (node.brick instanceof BrickModelBlock) {
            const childrenExtent = node.children.reduce(
                (acc, child) => {
                    const childExtent = child.brick.bBoxBrick.extent;
                    return {
                        width: Math.max(acc.width, childExtent.width),
                        height: acc.height + childExtent.height,
                    };
                },
                { width: 0, height: 0 },
            );

            node.brick.nestExtent = childrenExtent;
        }
    }

    /**
     * Checks if a connection is valid for a given node and position.
     * @param {IStackNode} node - The node to check.
     * @param {'above' | 'below'} position - The position to check.
     * @returns {boolean} True if the connection is valid, false otherwise.
     */
    private isValidConnection(node: IStackNode, position: 'above' | 'below'): boolean {
        if (!(node.brick instanceof BrickModelStatement || node.brick instanceof BrickModelBlock)) {
            return false;
        }

        if (position === 'above') {
            return node.brick.connectAbove;
        } else if (position === 'below') {
            return node.brick.connectBelow;
        }

        return false;
    }
}

/**
 * Creates a StackNode based on the provided brick model.
 * @param {BrickModelData | BrickModelExpression | BrickModelStatement | BrickModelBlock} brick - The brick model for the node.
 * @returns {IStackNode} A new StackNode instance.
 */
function createStackNode(
    brick: BrickModelData | BrickModelExpression | BrickModelStatement | BrickModelBlock,
): IStackNode {
    return new StackNode(brick);
}

// Export the Stack class and createStackNode function
export { Stack, createStackNode };
