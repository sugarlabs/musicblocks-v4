import type { IParsedElement, TPCOverride } from '../../@types/execution';
import type { TData } from '../../@types/data';

import {
    TreeNode,
    TreeNodeData,
    TreeNodeExpression,
    TreeNodeStatement,
    TreeNodeBlock,
} from '../../syntax/tree/node';

import { getProcessNodes, getRoutineNodes, getCrumbs } from '../../syntax/tree';
import { getInstance } from '../../syntax/warehouse';

import { ElementData, ElementExpression } from '../../syntax/elements/elementArgument';
import { ElementBlock, ElementStatement } from '../../syntax/elements/elementInstruction';

// -- private variables ----------------------------------------------------------------------------

/** Stores the list of process element nodes. */
let _processNodes: TreeNodeBlock[] = [];
/** Stores the list of routine element nodes. */
let _routineNodes: TreeNodeBlock[] = [];
/** Stores the list of crumb stack top element nodes. */
let _crumbNodes: TreeNode[] = [];

/** Type definition for an execution call stack frame. */
interface IFrame {
    /** Syntax tree node instance. */
    node: TreeNode;
    /** List of one level down syntax tree nodes to parse. */
    pages:
        | {
              /** Syntax tree node instance. */
              node: TreeNode;
              /** An identifier attached to it (usually argument name for argument nodes). */
              marker: string;
          }[]
        | null;
}

/** Type definition for each root element's parsing state table. */
type TProgramMapEntry = {
    /** Execution call frame stack. */
    frames: IFrame[];
    /** Program counter. */
    pc: TreeNode | null;
    /** Handler to update program counter. */
    pcHandler: (() => void)[];
    /** Signal to override program counter's normal sequence. */
    pcOverride: TPCOverride;
};

/** Maintains the parsing state tables. */
let _programMap: {
    /** Parsing state table for process elements. */
    process: {
        [nodeID: string]: TProgramMapEntry;
    };
    /** Parsing state table for routine elements. */
    routine: {
        [nodeID: string]: TProgramMapEntry;
    };
    /** Parsing state table for crumb (hanging) element stacks. */
    crumbs: {
        [nodeID: string]: TProgramMapEntry;
    };
} = {
    process: {},
    routine: {},
    crumbs: {},
};

/** Stores a reference to the starting node of parsing. */
let _executionItem: { node: TreeNode; bucket: 'process' | 'routine' | 'crumbs' } | null = null;

// -- private functions ----------------------------------------------------------------------------

/**
 * Helper that resets the parser.
 */
function _reset(): void {
    _processNodes = getProcessNodes();
    _routineNodes = getRoutineNodes();
    _crumbNodes = getCrumbs();

    _programMap = {
        process: {},
        routine: {},
        crumbs: {},
    };

    for (const processNode of _processNodes) {
        _programMap['process'][processNode.nodeID] = {
            frames: [],
            pc: null,
            pcHandler: [],
            pcOverride: null,
        };
    }

    for (const routineNode of _routineNodes) {
        _programMap['routine'][routineNode.nodeID] = {
            frames: [],
            pc: null,
            pcHandler: [],
            pcOverride: null,
        };
    }

    for (const crumbNode of _crumbNodes) {
        _programMap['crumbs'][crumbNode.nodeID] = {
            frames: [],
            pc: null,
            pcHandler: [],
            pcOverride: null,
        };
    }

    _executionItem = null;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Recursively validates the argument sequence for a syntax tree instruction node. Checks if there
 * are `null` argument connections.
 * @param instructionNode - syntax tree instruction node
 * @returns `null` if valid, else an object of the invalid syntax tree non-data node and arg name.
 */
export function validateArgumentSequence(
    instructionNode: TreeNodeStatement | TreeNodeBlock,
): { instruction: TreeNodeExpression | TreeNodeStatement | TreeNodeBlock; argName: string } | null {
    if (Object.keys(instructionNode.argConnections).length === 0) {
        return null;
    }

    function __validateArgumentSequence(
        node: TreeNodeExpression | TreeNodeStatement | TreeNodeBlock,
    ): {
        instruction: TreeNodeExpression | TreeNodeStatement | TreeNodeBlock;
        argName: string;
    } | null {
        for (const [argName, argNode] of Object.entries(node.argConnections)) {
            if (argNode === null) {
                return {
                    instruction: node,
                    argName,
                };
            } else {
                if (argNode instanceof TreeNodeExpression) {
                    const result = __validateArgumentSequence(argNode);
                    if (result !== null) {
                        return result;
                    }
                }
            }
        }
        return null;
    }

    return __validateArgumentSequence(instructionNode);
}

/**
 * Recursively generates the argument sequence for a syntax tree instruction node.
 * @description
 * Expects that argument sequence is valid — no `null` argument connections.
 * @param instructionNode - syntax tree instruction node
 * @returns a list of argument element instances
 */
export function generateArgumentSequence(
    instructionNode: TreeNodeStatement | TreeNodeBlock,
): (ElementData<TData> | ElementExpression<TData>)[] {
    if (Object.keys(instructionNode.argConnections).length === 0) {
        return [];
    }

    function __generateArgumentSequence(
        node: TreeNodeExpression | TreeNodeStatement | TreeNodeBlock,
    ): (ElementData<TData> | ElementExpression<TData>)[] {
        let sequence: (ElementData<TData> | ElementExpression<TData>)[] = [];

        Object.entries(node.argConnections!).forEach(([_, argNode]) => {
            if (argNode instanceof TreeNodeExpression) {
                sequence = [...sequence, ...__generateArgumentSequence(argNode!)];
            }
            sequence.push(
                getInstance(argNode!.instanceID)!.instance as
                    | ElementData<TData>
                    | ElementExpression<TData>,
            );
        });

        return sequence;
    }

    return __generateArgumentSequence(instructionNode);
}

/**
 * Sets the starting node of parsing.
 * @param nodeID - syntax tree node ID of the starting node.
 */
export function setExecutionItem(nodeID: string): void {
    _reset();

    let executionItemEntry: TProgramMapEntry | undefined = undefined;

    for (const processNode of _processNodes) {
        if (processNode.nodeID === nodeID) {
            _executionItem = { node: processNode, bucket: 'process' };
            executionItemEntry = _programMap['process'][nodeID];
            break;
        }
    }

    for (const routineNode of _routineNodes) {
        if (routineNode.nodeID === nodeID) {
            _executionItem = { node: routineNode, bucket: 'routine' };
            executionItemEntry = _programMap['routine'][nodeID];
            break;
        }
    }

    for (const crumbNode of _crumbNodes) {
        if (crumbNode.nodeID === nodeID) {
            _executionItem = { node: crumbNode, bucket: 'crumbs' };
            executionItemEntry = _programMap['crumbs'][nodeID];
            break;
        }
    }

    if (executionItemEntry !== undefined) {
        executionItemEntry.pc = _executionItem!.node;
        executionItemEntry.frames.push({
            node: _executionItem!.node,
            pages: null,
        });
    }
}

/**
 * Returns the starting syntax tree node ID of the starting node of parsing.
 * @returns - syntax tree node ID if present, else `null`
 */
export function getExecutionItem(): string | null {
    return _executionItem ? _executionItem.node.nodeID : null;
}

/**
 * Sets a program counter override signal for the current execution item.
 * @param signal - program counter override signal
 */
export function setPCOverride(signal: TPCOverride): void {
    if (_executionItem === null) {
        return;
    }

    _programMap[_executionItem.bucket][_executionItem.node.nodeID].pcOverride = signal;
}

/**
 * Clears any program counter override signal for the current execution item.
 */
export function clearPCOverride(): void {
    if (_executionItem === null) {
        return;
    }

    _programMap[_executionItem.bucket][_executionItem.node.nodeID].pcOverride = null;
}

/**
 * Returns the next node in execution sequence.
 * @returns - element entry if present, else `null`
 */
export function getNextElement(): IParsedElement | null {
    if (_executionItem === null) {
        /*
         * Nothing to execute
         */
        return null;
    }

    const executionItemEntry = _programMap[_executionItem.bucket][_executionItem.node.nodeID];

    if (executionItemEntry.pcHandler !== null) {
        executionItemEntry.pcHandler.forEach((handler) => handler());
        executionItemEntry.pcHandler = [];
    }

    const currentNode = executionItemEntry.pc;
    const frames = executionItemEntry.frames;

    if (currentNode === null) {
        if (frames.length === 0) {
            /*
             * Successful end of execution
             */

            _reset();
            return null;
        } else {
            /*
             * ERROR: Missing argument
             */

            const frame = frames[frames.length - 2];
            throw Error(
                `Invalid access: "${frame.pages![frame.pages!.length - 1].marker}" of "${
                    frame.node.elementName
                }" (node ID: "${frame.node.nodeID}")`,
            );
        }
    }

    const instance = getInstance(currentNode.instanceID)!.instance;

    function __handlePages(): { element: IParsedElement } | { marker: string | null } {
        const frame = frames[frames.length - 1];

        if (frame.pages === null) {
            frame.pages = [];

            Object.entries(
                (currentNode as TreeNodeExpression | TreeNodeStatement | TreeNodeBlock)
                    .argConnections,
            ).forEach(([argName, argNode]) =>
                frame.pages!.push({
                    node: argNode!,
                    marker: argName,
                }),
            );

            frame.pages = frame.pages.reverse();
        }

        if (frame.pages.length !== 0) {
            if (frame.pages[0].marker === '__rollback__') {
                executionItemEntry.pcHandler.push(() => {
                    if (executionItemEntry.pcOverride !== '__goinnerfirst__') {
                        frames.pop();
                    }
                });

                return { marker: '__rollback__' };
            }

            const upcomingNode = frame.pages[frame.pages.length - 1].node;

            executionItemEntry.pcHandler.push(() => {
                frames.push({
                    node: upcomingNode,
                    pages: null,
                });

                executionItemEntry.pc = upcomingNode;
            });

            return { element: getNextElement()! };
        } else {
            if (currentNode instanceof TreeNodeBlock) {
                frame.pages = [
                    {
                        node: currentNode as TreeNode,
                        marker: '__rollback__',
                    },
                ];

                __handleInstructionFall(true);

                return {
                    element: {
                        type: 'Instruction',
                        instance: instance as ElementBlock,
                        marker: null,
                    },
                };
            }

            frames.pop();

            let marker: string | null = null;

            if (currentNode instanceof TreeNodeExpression && frames.length !== 0) {
                const topFramePages = frames[frames.length - 1].pages!;
                marker = topFramePages[topFramePages.length - 1].marker;
                frames[frames.length - 1].pages!.pop();
            }

            return { marker };
        }
    }

    function __handleInstructionFall(goInner?: boolean): void {
        executionItemEntry.pcHandler.push(() => {
            let nextNode = (currentNode as TreeNodeStatement | TreeNodeBlock).afterConnection;

            if (currentNode instanceof TreeNodeBlock) {
                if (goInner || executionItemEntry.pcOverride === '__goinnerfirst__') {
                    nextNode = currentNode.innerConnection;
                }

                if (executionItemEntry.pcOverride === '__goinnerlast__') {
                    nextNode = currentNode.innerConnection;
                    while (nextNode !== null && nextNode.afterConnection !== null) {
                        nextNode = nextNode.afterConnection;
                    }
                } else if (executionItemEntry.pcOverride === '__skipscope__') {
                    frames[frames.length - 1].pages = [
                        {
                            node: currentNode as TreeNode,
                            marker: '__rollback__',
                        },
                    ];
                    nextNode = null;
                }
            }

            if (executionItemEntry.pcOverride === '__goup__') {
                nextNode = (currentNode as TreeNodeStatement | TreeNodeBlock).beforeConnection;
            } else if (executionItemEntry.pcOverride === '__skip__') {
                nextNode = (currentNode as TreeNodeStatement | TreeNodeBlock).afterConnection;
                if (nextNode !== null) {
                    nextNode = nextNode.afterConnection;
                }
            } else if (executionItemEntry.pcOverride === '__repeat__') {
                nextNode = currentNode as TreeNodeStatement | TreeNodeBlock;
            } else if (
                executionItemEntry.pcOverride === '__rollback__' ||
                executionItemEntry.pcOverride === '__rollback__i'
            ) {
                if (frames.length > 0) {
                    frames[frames.length - 1].pages = [
                        {
                            node: currentNode as TreeNode,
                            marker: '__rollback__',
                        },
                    ];
                }
                nextNode = null;
            }

            if (executionItemEntry.pcOverride !== '__rollback__i') {
                executionItemEntry.pcOverride = null;
            }

            if (nextNode === null) {
                if (frames.length !== 0) {
                    executionItemEntry.pc = frames[frames.length - 1].node;
                } else {
                    executionItemEntry.pc = nextNode;
                }
            } else {
                frames.push({
                    node: nextNode as TreeNodeStatement | TreeNodeBlock,
                    pages: null,
                });
                executionItemEntry.pc = nextNode;
            }
        });
    }

    if (currentNode instanceof TreeNodeData) {
        frames.pop();

        let marker: string | null = null;

        if (frames.length !== 0) {
            const topFramePages = frames[frames.length - 1].pages!;
            marker = topFramePages[topFramePages.length - 1].marker;
            frames[frames.length - 1].pages!.pop();
        }

        const element: IParsedElement = {
            type: 'Argument',
            instance: instance as ElementData<TData>,
            marker,
        };

        executionItemEntry.pcHandler.push(() => {
            executionItemEntry.pc = currentNode.connectedTo;
        });

        return element;
    } else if (currentNode instanceof TreeNodeExpression) {
        const result = __handlePages();
        if ('element' in result) {
            return result.element;
        }

        const element: IParsedElement = {
            type: 'Argument',
            instance: instance as ElementExpression<TData>,
            marker: result.marker,
        };

        executionItemEntry.pcHandler.push(() => {
            executionItemEntry.pc = currentNode.connectedTo;
        });

        return element;
    } /* currentNode instanceof TreeNodeStatement || currentNode instanceof TreeNodeBlock */ else {
        const result = __handlePages();
        if ('element' in result) {
            return result.element;
        }

        __handleInstructionFall();

        return {
            type: 'Instruction',
            instance:
                currentNode instanceof TreeNodeStatement
                    ? (instance as ElementStatement)
                    : (instance as ElementBlock),
            marker: result.marker,
        };
    }
}

/**
 * Returns the execution call frame stack of the current execution item.
 * @returns a list of execution call frames if execution item is set, else `null`
 */
export function stackTrace():
    | {
          elementName: string | null;
          nodeID: string | null;
          pages:
              | { elementName: string | null; nodeID: string | null; marker: string | null }[]
              | null;
      }[]
    | null {
    if (_executionItem === null) {
        return null;
    }

    const executionItemEntry = _programMap[_executionItem.bucket][_executionItem.node.nodeID];
    const currentNode = executionItemEntry.pc;
    return [
        ...executionItemEntry.frames.map(({ node, pages }) => ({
            elementName: node ? node.elementName : null,
            nodeID: node ? node.nodeID : null,
            pages: pages
                ? pages.map(({ node, marker }) => ({
                      elementName: node ? node.elementName : null,
                      nodeID: node ? node.nodeID : null,
                      marker,
                  }))
                : null,
        })),
        {
            elementName: currentNode ? currentNode.elementName : null,
            nodeID: currentNode ? currentNode.nodeID : null,
            pages: null,
        },
    ].reverse();
}

_reset();
