import { load as yamlToJson } from 'js-yaml';

import {
    ITreeSnapshotInput,
    generateFromSnapshot,
    generateSnapshot,
    resetSyntaxTree,
    getSpecificationSnapshot,
} from '@sugarlabs/musicblocks-v4-lib';

/** @todo these should be exposed */
import { IElementSpecificationSnapshot } from '@sugarlabs/musicblocks-v4-lib/@types/specification';
/** @todo these should be exposed */
import {
    ITreeSnapshotDataInput,
    ITreeSnapshotExpressionInput,
    ITreeSnapshotStatementInput,
    ITreeSnapshotBlockInput,
} from '@sugarlabs/musicblocks-v4-lib/@types/syntaxTree';
/** @todo these should not be required */
import {
    addInstance,
    getInstance,
    removeInstance,
} from '@sugarlabs/musicblocks-v4-lib/syntax/warehouse/warehouse';

import { ICodeInstructionSnapshot, ICodeInstructionSnapshotObj } from '../@types';

// -- private variables ----------------------------------------------------------------------------

interface IElementSpecificationSnapshotWithArgs extends IElementSpecificationSnapshot {
    args: [string, string[]][] | null;
}

/**
 * Snapshot entry table object with key-value pairs of element name and corresponding element
 * specification snapshot.
 */
let _specificationSnapshot: {
    [name: string]: IElementSpecificationSnapshotWithArgs;
};

// -- public functions -----------------------------------------------------------------------------

/**
 * Generates the API for the loaded specification.
 * @returns list of valid instruction signatures
 */
export function generateAPI(): string {
    /*
     * Filter out only instruction (statement, block) elements in specification snapshot.
     */

    _specificationSnapshot = Object.fromEntries(
        Object.entries(getSpecificationSnapshot())
            .filter(([_, specification]) => ['Statement', 'Block'].includes(specification.type))
            .map(([elementName, specification]) => [elementName, { ...specification, args: null }]),
    );

    /**
     * @todo args should be part of the supplied specification snapshot
     * Add args to the specification.
     */

    Object.entries(_specificationSnapshot).forEach(([elementName, _]) => {
        const instanceID = addInstance(elementName);
        const instance = getInstance(instanceID)!.instance;

        _specificationSnapshot[elementName]['args'] =
            instance.argLabels.length === 0
                ? null
                : (instance.argLabels.map((arg) => [arg, instance.getArgType(arg)]) as [
                      string,
                      string[],
                  ][]);

        removeInstance(instanceID);
    });

    /**
     * Group syntax elements by categories.
     */

    const items: {
        [key: string]: [string, 'Statement' | 'Block', [string, string[]][] | null][];
    } = {};

    Object.entries(_specificationSnapshot).forEach(([elementName, specification]) => {
        const category = specification.category;

        if (!(category in items)) {
            items[category] = [];
        }

        items[category].push([
            elementName,
            specification.type as 'Statement' | 'Block',
            specification.args,
        ]);
    });

    /**
     * Generate API.
     */

    const api: string[] = [];

    Object.entries(items).forEach(([category, elements]) => {
        api.push(`# "${category}" elements\n# ------------------------`);
        elements.forEach(([name, type, args]) => {
            if (type === 'Statement') {
                if (args === null) {
                    api.push(`- ${name}`);
                } else if (args.length === 1) {
                    api.push(`- ${name}: ${args[0][1].join('|')}`);
                } else {
                    api.push(
                        `- ${name}:\n${args
                            .map(([name, types]) => `    ${name}: ${types.join('|')}`)
                            .join('\n')}`,
                    );
                }
            } else {
                if (args === null) {
                    api.push(`- ${name}:\n    scope:\n      - [instruction]\n      - ...`);
                } else {
                    api.push(
                        `- ${name}:\n${args
                            .map(([name, types]) => `    ${name}: ${types.join('|')}`)
                            .join('\n')}\n    scope:\n      - [instruction]\n      - ...`,
                    );
                }
            }
        });
        api.push('\n');
    });

    return api.join('\n');
}

/**
 * Validates code, transpiles it, and generates the Syntax Tree in the Programming Engine.
 * @param code editor's code
 * @returns a `Promise` that returns whether the process was successful
 */
export function buildProgram(code: string): Promise<boolean> {
    let instructions: ICodeInstructionSnapshot[];

    function __checkValidity(): boolean {
        try {
            instructions = yamlToJson(code) as ICodeInstructionSnapshot[];
            return instructions instanceof Array;
        } catch (e) {
            const _err = e as {
                mark: {
                    buffer: string;
                    column: number;
                    line: number;
                    name: string | null;
                    position: number;
                };
                message: string;
                name: string;
                reason: string;
            };
            console.log({
                mark: _err.mark,
                message: _err.message,
                name: _err.name,
                reason: _err.reason,
            });
            return false;
        }
    }

    function __transpile(): void {
        function __createInstructionSnapshot(
            instruction: ICodeInstructionSnapshot,
        ): ITreeSnapshotStatementInput | ITreeSnapshotBlockInput {
            if (typeof instruction === 'string') {
                return {
                    elementName: instruction,
                    argMap: null,
                };
            } else {
                const treeSnapshotInput: ITreeSnapshotStatementInput | ITreeSnapshotBlockInput = {
                    elementName: '',
                    argMap: null,
                };
                const [key, value] = [
                    // there's only one instruction
                    Object.keys(instruction)[0],
                    instruction[Object.keys(instruction)[0]],
                ];

                treeSnapshotInput.elementName = key;

                if (value instanceof Object) {
                    let scope: (ITreeSnapshotStatementInput | ITreeSnapshotBlockInput)[] | null =
                        null;
                    if ('scope' in value) {
                        scope = (value.scope as ICodeInstructionSnapshotObj[]).map((instruction) =>
                            __createInstructionSnapshot(instruction),
                        );
                    }

                    const argMap: {
                        [argName: string]:
                            | ITreeSnapshotDataInput
                            | ITreeSnapshotExpressionInput
                            | null;
                    } = {};
                    Object.entries(value).forEach(([param, arg]) => {
                        if (param !== 'scope') {
                            if (!['boolean', 'number', 'string'].includes(typeof arg)) {
                                throw Error(
                                    `InvalidArgumentError: ${arg} of type "${typeof arg}" is invalid`,
                                );
                            }

                            const type =
                                typeof arg === 'boolean'
                                    ? 'value-boolean'
                                    : typeof arg === 'number'
                                    ? 'value-number'
                                    : 'value-string';
                            argMap[param] = {
                                elementName: type,
                                value: arg.toString(),
                            };
                        }
                    });
                    treeSnapshotInput.argMap = argMap;

                    if (scope) {
                        (treeSnapshotInput as ITreeSnapshotBlockInput).scope = scope;
                    }
                } else {
                    if (
                        _specificationSnapshot[key].args &&
                        _specificationSnapshot[key].args!.length === 1
                    ) {
                        const type =
                            typeof value === 'boolean'
                                ? 'value-boolean'
                                : typeof value === 'number'
                                ? 'value-number'
                                : 'value-string';

                        treeSnapshotInput.argMap = Object.fromEntries([
                            [
                                _specificationSnapshot[key].args![0][0],
                                {
                                    elementName: type,
                                    value: value.toString(),
                                },
                            ],
                        ]);
                    }
                }

                return treeSnapshotInput;
            }
        }

        const snapshot: ITreeSnapshotInput = {
            process: [],
            routine: [],
            crumbs: [instructions.map((instruction) => __createInstructionSnapshot(instruction))],
        };

        generateFromSnapshot(snapshot);
    }

    return new Promise((resolve) => {
        if (__checkValidity() === false) {
            resolve(false);
        } else {
            const snapshot = generateSnapshot();
            try {
                __transpile();
                resolve(true);
            } catch (e) {
                console.log(e);
                generateFromSnapshot(snapshot);
                resolve(false);
            }
        }
    });
}

/**
 * Resets the program — generates an empty Syntax Tree.
 */
export function resetProgram(): void {
    resetSyntaxTree();
}
