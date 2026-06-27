import { v4 as uuidv4 } from 'uuid';

import type {
    ITreeSnapshot,
    ITreeSnapshotInput,
    ITreeSnapshotDataInput,
    ITreeSnapshotExpressionInput,
    ITreeSnapshotStatement,
    ITreeSnapshotStatementInput,
    ITreeSnapshotBlock,
    ITreeSnapshotBlockInput,
} from '../../@types/syntaxTree';
import type { IElementSpecificationInstruction } from '../../@types/specification';
import type { TData } from '../../@types/data';

import {
    TreeNode,
    TreeNodeData,
    TreeNodeExpression,
    TreeNodeStatement,
    TreeNodeBlock,
} from './node';
import { addInstance, getInstance, removeInstance } from '../warehouse';
import { checkValueAssignment, queryElementSpecification } from '../specification';

import { ElementArgument } from '../elements/elementArgument';

// -- private variables ----------------------------------------------------------------------------

/** Stores a table with key-value pairs of node ID and corresponding node instance. */
const _nodeMap: { [nodeID: string]: TreeNode } = {};

/** Stores the syntax tree. */
let _syntaxTree: {
    /** Stores a list of all process element nodes. */
    process: TreeNodeBlock[];
    /** Stores a list of all routine element nodes. */
    routine: TreeNodeBlock[];
    /** Stores a list of all non-process and non-routine element node lists. */
    crumbs: TreeNode[];
} = {
    process: [],
    routine: [],
    crumbs: [],
};

// -- private functions ----------------------------------------------------------------------------

/**
 * Helper that removes corresponding element instance and removes node table entry.
 * @param nodeID - node ID
 */
function _destroyNode(nodeID: string): void {
    if (!(nodeID in _nodeMap)) {
        return;
    }

    const node = _nodeMap[nodeID];
    removeInstance(node.instanceID);
    delete _nodeMap[nodeID];
}

/**
 * Helper that checks whether two instruction element nodes can be connected.
 * @param connectorNodeID - node ID of the connector node
 * @param connectingNodeID - node ID of the connecting node
 * @returns `true` if node connections are valid, else `false`
 */
function _attachInstructionCheck(connectorNodeID: string, connectingNodeID: string): boolean {
    if (!(connectorNodeID in _nodeMap) || !(connectingNodeID in _nodeMap)) {
        return false;
    }

    const nodeConnector = _nodeMap[connectorNodeID];
    const nodeConnecting = _nodeMap[connectingNodeID];

    const specificationConnector = queryElementSpecification(nodeConnector.elementName)!;
    const specificationConnecting = queryElementSpecification(nodeConnecting.elementName)!;

    if (
        specificationConnector.type === 'Data' ||
        specificationConnector.type === 'Expression' ||
        specificationConnecting.type === 'Data' ||
        specificationConnecting.type === 'Expression'
    ) {
        return false;
    }

    return true;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * @returns the list of process element nodes.
 */
export function getProcessNodes(): TreeNodeBlock[] {
    return _syntaxTree['process'];
}

/**
 * @returns the list of routine element nodes.
 */
export function getRoutineNodes(): TreeNodeBlock[] {
    return _syntaxTree['routine'];
}

/**
 * @returns the list of top instruction element nodes of crumb stacks.
 */
export function getCrumbs(): TreeNode[] {
    return _syntaxTree['crumbs'];
}

/**
 * Adds a new element to the syntax tree.
 * @param name - name of the syntax element
 * @returns node ID of the syntax tree node
 */
export function addNode(name: string): string {
    const instanceID = addInstance(name);
    let nodeID: string;
    do {
        nodeID = uuidv4();
    } while (nodeID in _nodeMap);

    let node: TreeNode;

    const specification = queryElementSpecification(name)!;
    switch (specification.type) {
        case 'Data':
            node = new TreeNodeData(name, nodeID, instanceID);
            break;
        case 'Expression':
            node = new TreeNodeExpression(name, nodeID, instanceID);
            break;
        case 'Statement':
            node = new TreeNodeStatement(name, nodeID, instanceID);
            break;
        case 'Block':
        default:
            node = new TreeNodeBlock(name, nodeID, instanceID);
    }

    _nodeMap[nodeID] = node;
    if (name === 'process') {
        _syntaxTree['process'].push(node as TreeNodeBlock);
    } else if (name === 'routine') {
        _syntaxTree['routine'].push(node as TreeNodeBlock);
    } else {
        _syntaxTree['crumbs'].push(node);
    }

    return nodeID;
}

/**
 * Returns a new entry from the syntax tree.
 * @param nodeID - node ID of the syntax tree node
 * @returns syntax tree node entry if present, else `null`
 */
export function getNode(nodeID: string): TreeNode | null {
    return nodeID in _nodeMap ? _nodeMap[nodeID] : null;
}

/**
 * Removes an element node from the syntax tree.
 * @param nodeID - node ID of the syntax tree node
 */
export function removeNode(nodeID: string): void {
    if (!(nodeID in _nodeMap)) {
        return;
    }

    const node = _nodeMap[nodeID];

    let list: TreeNode[];

    if (node.elementName === 'process') {
        list = _syntaxTree['process'];
    } else if (node.elementName === 'routine') {
        list = _syntaxTree['routine'];
    } else {
        list = _syntaxTree['crumbs'];
    }

    list.splice(list.indexOf(node), 1);

    _destroyNode(nodeID);
}

/**
 * Resets the syntax tree — removes all nodes and syntax element instances.
 */
export function resetSyntaxTree(): void {
    Object.entries(_nodeMap).forEach(([nodeID]) => {
        _destroyNode(nodeID);
    });

    _syntaxTree = {
        process: [],
        routine: [],
        crumbs: [],
    };
}

/**
 * Checks whether an argument element node can be connected.
 * @param connectorNodeID - node ID of the connector node
 * @param connectingNodeID - node ID of the connecting argument element node
 * @returns - `true` if node connections are valid, else `false`
 */
export function attachArgumentCheck(
    connectorNodeID: string,
    connectingNodeID: string,
    argName: string,
): boolean {
    if (!(connectorNodeID in _nodeMap) || !(connectingNodeID in _nodeMap)) {
        return false;
    }

    const nodeConnector = _nodeMap[connectorNodeID];
    const nodeConnecting = _nodeMap[connectingNodeID];

    const specificationConnector = queryElementSpecification(nodeConnector.elementName)!;
    const specificationConnecting = queryElementSpecification(nodeConnecting.elementName)!;

    if (
        specificationConnector.type === 'Data' ||
        specificationConnecting.type === 'Statement' ||
        specificationConnecting.type === 'Block'
    ) {
        return false;
    }

    const instanceConnector = getInstance(nodeConnector.instanceID)!;
    const instanceConnecting = getInstance(nodeConnecting.instanceID)!;

    if (!instanceConnector.instance.argLabels.includes(argName)) {
        return false;
    }

    const typeConnector = instanceConnector.instance.getArgType(argName);
    const typeConnecting = (instanceConnecting.instance as ElementArgument<TData>).returnType;

    for (const type of typeConnecting) {
        if (!typeConnector.includes(type)) {
            return false;
        }
    }

    return true;
}

/**
 * Attaches an argument element node.
 * @param connectorNodeID - node ID of the connector node
 * @param connectingNodeID - node ID of the connecting argument element node
 * @param argName - name of the argument
 */
export function attachArgument(
    connectorNodeID: string,
    connectingNodeID: string,
    argName: string,
): void {
    const nodeConnector = _nodeMap[connectorNodeID] as
        | TreeNodeExpression
        | TreeNodeStatement
        | TreeNodeBlock;
    const nodeConnecting = _nodeMap[connectingNodeID] as TreeNodeData | TreeNodeExpression;

    nodeConnector.attachArg(argName, nodeConnecting);
    nodeConnecting.connectedTo = nodeConnector;

    if (_syntaxTree.crumbs.includes(nodeConnecting)) {
        _syntaxTree.crumbs.splice(_syntaxTree.crumbs.indexOf(nodeConnecting), 1);
    }
}

/**
 * Detaches an argument element node.
 * @param connectorNodeID - node ID of the connector node
 * @param connectingNodeID - node ID of the connecting argument element node
 * @param argName - name of the argument
 */
export function detachArgument(
    connectorNodeID: string,
    connectingNodeID: string,
    argName: string,
): void {
    const nodeConnector = _nodeMap[connectorNodeID] as
        | TreeNodeExpression
        | TreeNodeStatement
        | TreeNodeBlock;
    const nodeConnecting = _nodeMap[connectingNodeID] as TreeNodeData | TreeNodeExpression;

    nodeConnector.detachArg(argName);
    nodeConnecting.connectedTo = null;

    _syntaxTree.crumbs.push(nodeConnecting);
}

/**
 * Checks whether an instruction element node can be connected in sequence after another instruction
 * element node.
 * @param connectorNodeID - node ID of the connector instruction element node
 * @param connectingNodeID - node ID of the connecting instruction element node
 * @returns - `true` if node connections are valid, else `false`
 */
export function attachInstructionBelowCheck(
    connectorNodeID: string,
    connectingNodeID: string,
): boolean {
    if (!_attachInstructionCheck(connectorNodeID, connectingNodeID)) {
        return false;
    }

    const nodeConnector = _nodeMap[connectorNodeID];
    const nodeConnecting = _nodeMap[connectingNodeID];

    const specificationConnector = queryElementSpecification(
        nodeConnector.elementName,
    )! as IElementSpecificationInstruction;
    const specificationConnecting = queryElementSpecification(
        nodeConnecting.elementName,
    )! as IElementSpecificationInstruction;

    if (
        (specificationConnector.forbidBelow &&
            specificationConnector.forbidBelow.includes(nodeConnecting.elementName)) ||
        (specificationConnecting.forbidAbove &&
            specificationConnecting.forbidAbove.includes(nodeConnector.elementName))
    ) {
        return false;
    }

    if (specificationConnector.allowBelow !== undefined) {
        if (specificationConnector.allowBelow instanceof Array) {
            if (!specificationConnector.allowBelow.includes(nodeConnecting.elementName)) {
                return false;
            }
        } else {
            if ((specificationConnector.allowBelow as boolean) === false) {
                return false;
            }
        }
    }

    if (specificationConnecting.allowAbove !== undefined) {
        if (specificationConnecting.allowAbove instanceof Array) {
            if (!specificationConnecting.allowAbove.includes(nodeConnector.elementName)) {
                return false;
            }
        } else {
            if ((specificationConnector.allowAbove as boolean) === false) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Attaches an instruction element node in sequence after another instruction element node.
 * @param connectorNodeID - node ID of the connector instruction element node
 * @param connectingNodeID - node ID of the connecting instruction element node
 */
export function attachInstructionBelow(connectorNodeID: string, connectingNodeID: string): void {
    const nodeConnector = _nodeMap[connectorNodeID] as TreeNodeStatement | TreeNodeBlock;
    const nodeConnecting = _nodeMap[connectingNodeID] as TreeNodeStatement | TreeNodeBlock;

    nodeConnector.afterConnection = nodeConnecting;

    nodeConnecting.beforeConnection = nodeConnector;
    nodeConnecting.nestLevel = nodeConnector.nestLevel;
    nodeConnecting.parentBlock = nodeConnector.parentBlock;

    if (_syntaxTree.crumbs.includes(nodeConnecting)) {
        _syntaxTree.crumbs.splice(_syntaxTree.crumbs.indexOf(nodeConnecting), 1);
    }
}

/**
 * Detaches an instruction element node from sequence after another instruction element node.
 * @param connectorNodeID - node ID of the connector instruction element node
 * @param connectingNodeID - node ID of the connecting instruction element node
 */
export function detachInstructionBelow(connectorNodeID: string, connectingNodeID: string): void {
    const nodeConnector = _nodeMap[connectorNodeID] as TreeNodeStatement | TreeNodeBlock;
    const nodeConnecting = _nodeMap[connectingNodeID] as TreeNodeStatement | TreeNodeBlock;

    nodeConnector.afterConnection = null;

    nodeConnecting.beforeConnection = null;
    nodeConnecting.nestLevel = 0;
    nodeConnecting.parentBlock = null;

    _syntaxTree.crumbs.push(nodeConnecting);
}

/**
 * Checks whether an instruction element node can be nested inside a block element node.
 * @param connectorNodeID - node ID of the connector block element node
 * @param connectingNodeID - node ID of the connecting instruction element node
 * @returns - `true` if node connections are valid, else `false`
 */
export function attachInstructionInsideCheck(
    connectorNodeID: string,
    connectingNodeID: string,
): boolean {
    if (!_attachInstructionCheck(connectorNodeID, connectingNodeID)) {
        return false;
    }

    const nodeConnector = _nodeMap[connectorNodeID];
    const nodeConnecting = _nodeMap[connectingNodeID];

    const specificationConnector = queryElementSpecification(nodeConnector.elementName)!;
    const specificationConnecting = queryElementSpecification(nodeConnecting.elementName)!;

    if (
        !(
            specificationConnector.type === 'Block' &&
            (specificationConnecting.type === 'Statement' ||
                specificationConnecting.type === 'Block')
        )
    ) {
        return false;
    }

    if (
        (specificationConnector.forbidNestInside &&
            specificationConnector.forbidNestInside.includes(nodeConnecting.elementName)) ||
        (specificationConnecting.forbiddenNestInside &&
            specificationConnecting.forbiddenNestInside.includes(nodeConnector.elementName))
    ) {
        return false;
    }

    if (specificationConnector.allowNestInside !== undefined) {
        if (specificationConnector.allowNestInside instanceof Array) {
            if (!specificationConnector.allowNestInside.includes(nodeConnecting.elementName)) {
                return false;
            }
        } else {
            if ((specificationConnector.allowNestInside as boolean) === false) {
                return false;
            }
        }
    }

    if (specificationConnecting.allowedNestInside !== undefined) {
        if (specificationConnecting.allowedNestInside instanceof Array) {
            if (!specificationConnecting.allowedNestInside.includes(nodeConnector.elementName)) {
                return false;
            }
        } else {
            if ((specificationConnector.allowedNestInside as boolean) === false) {
                return false;
            }
        }
    }

    if (
        !(
            specificationConnecting.allowedNestLevel &&
            specificationConnecting.allowedNestLevel instanceof Array &&
            specificationConnecting.allowedNestLevel.includes(
                (nodeConnector as TreeNodeStatement | TreeNodeBlock).nestLevel + 1,
            )
        )
    ) {
        return false;
    }

    return true;
}

/**
 * Attaches an instruction element node inside a block element node.
 * @param connectorNodeID - node ID of the connector block element node
 * @param connectingNodeID - node ID of the connecting instruction element node
 */
export function attachInstructionInside(connectorNodeID: string, connectingNodeID: string): void {
    const nodeConnector = _nodeMap[connectorNodeID] as TreeNodeBlock;
    const nodeConnecting = _nodeMap[connectingNodeID] as TreeNodeStatement | TreeNodeBlock;

    nodeConnector.innerConnection = nodeConnecting;
    nodeConnector.innerCount++;

    nodeConnecting.parentBlock = nodeConnector;
    nodeConnecting.nestLevel = nodeConnector.nestLevel + 1;

    if (_syntaxTree.crumbs.includes(nodeConnecting)) {
        _syntaxTree.crumbs.splice(_syntaxTree.crumbs.indexOf(nodeConnecting), 1);
    }
}

/**
 * Attaches an instruction element node from inside a block element node.
 * @param connectorNodeID - node ID of the connector block element node
 * @param connectingNodeID - node ID of the connecting instruction element node
 */
export function detachInstructionInside(connectorNodeID: string, connectingNodeID: string): void {
    const nodeConnector = _nodeMap[connectorNodeID] as TreeNodeBlock;
    const nodeConnecting = _nodeMap[connectingNodeID] as TreeNodeStatement | TreeNodeBlock;

    nodeConnector.innerConnection = null;
    nodeConnector.innerCount--;

    nodeConnecting.parentBlock = null;
    nodeConnecting.nestLevel = 0;

    _syntaxTree.crumbs.push(nodeConnecting);
}

/**
 * Generates a snapshot of the syntax tree.
 * @returns syntax tree snapshot
 */
export function generateSnapshot(): ITreeSnapshot {
    const snapshot: ITreeSnapshot = {
        process: _syntaxTree.process.map((node) => node.snapshot),
        routine: _syntaxTree.routine.map((node) => node.snapshot),
        crumbs: [],
    };

    _syntaxTree.crumbs.forEach((node) => {
        if (node instanceof TreeNodeData || node instanceof TreeNodeExpression) {
            snapshot.crumbs.push([node.snapshot]);
        } else {
            const snapshotList: (ITreeSnapshotStatement | ITreeSnapshotBlock)[] = [];
            let nextNode: TreeNodeStatement | TreeNodeBlock | null = node as
                | TreeNodeStatement
                | TreeNodeBlock;
            while (nextNode !== null) {
                snapshotList.push(nextNode.snapshot);
                nextNode = nextNode.afterConnection;
            }
            snapshot.crumbs.push(snapshotList);
        }
    });

    return snapshot;
}

/**
 * Generates the syntax tree from a snapshot.
 * @param snapshot - syntax tree snapshot
 * @throws `InvalidDataError`
 */
export function generateFromSnapshot(snapshot: ITreeSnapshotInput): void {
    resetSyntaxTree();

    function __generateSnapshotList(
        snapshotList: (
            | ITreeSnapshotDataInput
            | ITreeSnapshotExpressionInput
            | ITreeSnapshotStatementInput
            | ITreeSnapshotBlockInput
        )[],
    ): string | null {
        if (snapshotList.length === 0) {
            return null;
        }

        const snapshotNodes = snapshotList.map((snapshot) => {
            const specification = queryElementSpecification(snapshot.elementName);
            let nodeID: string;
            switch (specification!.type) {
                case 'Data':
                    nodeID = __generateFromSnapshotData(snapshot as ITreeSnapshotDataInput);
                    break;
                case 'Expression':
                    nodeID = __generateFromSnapshotExpression(
                        snapshot as ITreeSnapshotExpressionInput,
                    );
                    break;
                case 'Statement':
                    nodeID = __generateFromSnapshotStatement(
                        snapshot as ITreeSnapshotStatementInput,
                    );
                    break;
                case 'Block':
                default:
                    nodeID = __generateFromSnapshotBlock(snapshot as ITreeSnapshotBlockInput);
            }
            return nodeID;
        });

        if (snapshotNodes.length > 1) {
            for (let i = 0; i < snapshotNodes.length - 1; i++) {
                attachInstructionBelow(snapshotNodes[i], snapshotNodes[i + 1]);
            }
        }

        return snapshotNodes[0];
    }

    function __generateFromSnapshotArg(
        nodeID: string,
        snapshot: {
            [argName: string]: ITreeSnapshotDataInput | ITreeSnapshotExpressionInput | null;
        } | null,
    ): void {
        if (snapshot === null) {
            return;
        }

        Object.entries(snapshot).forEach(([argName, snapshot]) => {
            if (snapshot === null) {
                return;
            }

            let argNodeID: string;
            const specification = queryElementSpecification(snapshot.elementName)!;
            if (specification.type === 'Data') {
                argNodeID = __generateFromSnapshotData(snapshot as ITreeSnapshotDataInput);
            } else {
                argNodeID = __generateFromSnapshotExpression(
                    snapshot as ITreeSnapshotExpressionInput,
                );
            }

            attachArgument(nodeID, argNodeID, argName);
        });
    }

    function __generateFromSnapshotData(snapshot: ITreeSnapshotDataInput): string {
        const nodeID = addNode(snapshot.elementName);
        if (snapshot.value) {
            const instance = getInstance(getNode(nodeID)!.instanceID)!.instance;
            if (checkValueAssignment(instance.name, snapshot.value)) {
                instance.updateLabel(snapshot.value);
            } else {
                throw Error(
                    `InvalidDataError: value "${snapshot.value}" cannot be assigned to data element "${instance.name}"`,
                );
            }
        }
        return nodeID;
    }

    function __generateFromSnapshotExpression(snapshot: ITreeSnapshotExpressionInput): string {
        const nodeID = addNode(snapshot.elementName);
        __generateFromSnapshotArg(nodeID, snapshot.argMap);
        return nodeID;
    }

    function __generateFromSnapshotStatement(snapshot: ITreeSnapshotStatementInput): string {
        const nodeID = addNode(snapshot.elementName);
        __generateFromSnapshotArg(nodeID, snapshot.argMap);
        return nodeID;
    }

    function __generateFromSnapshotBlock(snapshot: ITreeSnapshotBlockInput): string {
        const nodeID = addNode(snapshot.elementName);
        __generateFromSnapshotArg(nodeID, snapshot.argMap);
        const innerNodeID = __generateSnapshotList(snapshot.scope);
        if (innerNodeID !== null) {
            attachInstructionInside(nodeID, innerNodeID);
        }
        return nodeID;
    }

    try {
        snapshot.process.forEach((snapshot) => __generateFromSnapshotBlock(snapshot));
        snapshot.routine.forEach((snapshot) => __generateFromSnapshotBlock(snapshot));
        snapshot.crumbs.forEach((snapshotList) => __generateSnapshotList(snapshotList));
    } catch (e) {
        resetSyntaxTree();
        throw e;
    }
}

/**
 * Assigns the value (label) of the data element instance included in the node `nodeID`.
 * @param nodeID node ID of the syntax tree node
 * @param value value to assign
 * @returns whether successful assignment or not
 */
export function assignNodeValue(nodeID: string, value: string): boolean {
    try {
        const instance = getInstance(getNode(nodeID)!.instanceID)!.instance;
        if (instance.type === 'Data' && checkValueAssignment(instance.name, value)) {
            instance.updateLabel(value);
        } else {
            throw Error();
        }
    } catch (e) {
        return false;
    }

    return true;
}
