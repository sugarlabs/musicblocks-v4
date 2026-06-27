import type {
    ITreeNode,
    ITreeNodeArgument,
    ITreeNodeBlock,
    ITreeNodeData,
    ITreeNodeExpression,
    ITreeNodeInstruction,
    ITreeNodeStatement,
    ITreeSnapshotBlock,
    ITreeSnapshotData,
    ITreeSnapshotExpression,
    ITreeSnapshotStatement,
} from '../../@types/syntaxTree';

import { getInstance } from '../warehouse';

// -------------------------------------------------------------------------------------------------

/**
 * @virtual
 * @class
 * Defines a generic syntax tree node.
 */
export abstract class TreeNode implements ITreeNode {
    /** Stores the name of the syntax element. */
    protected _elementName: string;
    /** Stores the node ID of the syntax tree node instance. */
    protected _nodeID: string;
    /** Stores the warehouse ID of the syntax element instance. */
    protected _instanceID: string;

    /** Stores key-value pairs of argument names and corresponding argument nodes. */
    protected _argConnections: { [arg: string]: TreeNodeData | TreeNodeExpression | null } = {};

    constructor(
        /** Name of the syntax element. */
        elementName: string,
        /** Node ID of the syntax tree node instance. */
        nodeID: string,
        /** Warehouse ID of the syntax element instance. */
        instanceID: string,
    ) {
        this._elementName = elementName;
        this._nodeID = nodeID;
        this._instanceID = instanceID;

        const instance = getInstance(this._instanceID)!;
        instance.instance.argLabels.forEach((label) => (this._argConnections[label] = null));
    }

    public abstract get elementName(): string;

    public get nodeID(): string {
        return this._nodeID;
    }

    public get instanceID(): string {
        return this._instanceID;
    }

    /**
     * Helper that adds an argument connection.
     * @param argName - name of the argument
     * @param node - node instance of the connecting node
     */
    protected _attachArg(argName: string, node: TreeNodeData | TreeNodeExpression): void {
        this._argConnections[argName] = node;
    }

    /**
     * Helper that removes an argument connection.
     * @param argName - name of the argument
     */
    protected _detachArg(argName: string): void {
        this._argConnections[argName] = null;
    }

    /**
     * Helper that generates a snapshot of the arguments.
     */
    protected _getArgSnapshot(): {
        [argName: string]: ITreeSnapshotData | ITreeSnapshotExpression | null;
    } | null {
        const instance = getInstance(this._instanceID)!;

        if (instance.instance.argCount === 0) {
            return null;
        }
        this._elementName;

        const snapshot: {
            [argName: string]: ITreeSnapshotData | ITreeSnapshotExpression | null;
        } = {};

        instance.instance.argLabels.forEach(
            (label) =>
                (snapshot[label] =
                    this._argConnections[label] === null
                        ? null
                        : this._argConnections[label]!.snapshot),
        );

        return snapshot;
    }
}

/**
 * @virtual
 * @class
 * Defines a generic syntax tree argument element node.
 */
abstract class TreeNodeArgument extends TreeNode implements ITreeNodeArgument {
    public connectedTo: Exclude<TreeNode, TreeNodeData> | null = null;
}

/**
 * @class
 * Defines a syntax tree data element node.
 */
export class TreeNodeData extends TreeNodeArgument implements ITreeNodeData {
    public get elementName(): string {
        return this._elementName;
    }

    public get snapshot(): ITreeSnapshotData {
        return {
            elementName: this._elementName,
            nodeID: this._nodeID,
        };
    }
}

/**
 * @class
 * Defines a syntax tree expression element node.
 */
export class TreeNodeExpression extends TreeNodeArgument implements ITreeNodeExpression {
    public get elementName(): string {
        return this._elementName;
    }

    public get snapshot(): ITreeSnapshotExpression {
        return {
            elementName: this._elementName,
            nodeID: this._nodeID,
            argMap: this._getArgSnapshot(),
        };
    }

    public argConnections = this._argConnections;

    public attachArg = super._attachArg;
    public detachArg = super._detachArg;
}

/**
 * @virtual
 * @class
 * Defines a generic syntax tree instruction element node.
 */
abstract class TreeNodeInstruction extends TreeNode implements ITreeNodeInstruction {
    public argConnections = this._argConnections;
    public attachArg = super._attachArg;
    public detachArg = super._detachArg;

    public beforeConnection: TreeNodeStatement | TreeNodeBlock | null = null;
    public afterConnection: TreeNodeStatement | TreeNodeBlock | null = null;
    public nestLevel: number = 0;
    public parentBlock: TreeNodeBlock | null = null;
}

/**
 * @class
 * Defines a syntax tree statement element node.
 */
export class TreeNodeStatement extends TreeNodeInstruction implements ITreeNodeStatement {
    public get elementName(): string {
        return this._elementName;
    }

    public get snapshot(): ITreeSnapshotStatement {
        return {
            elementName: this._elementName,
            nodeID: this._nodeID,
            argMap: this._getArgSnapshot(),
        };
    }
}

/**
 * @class
 * Defines a syntax tree block element node.
 */
export class TreeNodeBlock extends TreeNodeInstruction implements ITreeNodeBlock {
    public get elementName(): string {
        return this._elementName;
    }

    public get snapshot(): ITreeSnapshotBlock {
        const scope: (ITreeSnapshotStatement | ITreeSnapshotBlock)[] = [];

        let nextNode: TreeNodeStatement | TreeNodeBlock | null = this.innerConnection;
        while (nextNode !== null) {
            scope.push(nextNode.snapshot);
            nextNode = nextNode.afterConnection;
        }

        return {
            elementName: this._elementName,
            nodeID: this._nodeID,
            argMap: this._getArgSnapshot(),
            scope,
        };
    }

    public innerConnection: TreeNodeStatement | TreeNodeBlock | null = null;
    public innerCount: number = 0;
}
