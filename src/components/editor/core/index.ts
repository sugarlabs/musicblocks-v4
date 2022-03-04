import { load as yamlToJson } from 'js-yaml';

import {
    ITreeSnapshotInput,
    generateFromSnapshot,
    generateSnapshot,
    resetSyntaxTree,
    getSpecificationSnapshot,
} from '@sugarlabs/musicblocks-v4-lib';

/** @todo these should be exposed */
import {
    TElementType,
    IElementSpecificationSnapshot,
} from '@sugarlabs/musicblocks-v4-lib/@types/specification';
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

import { ICodeArgumentObj, ICodeArgument, ICodeInstruction } from '../@types';

import { InvalidArgumentError, InvalidInstructionError } from './errors';

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
    _specificationSnapshot = Object.fromEntries(
        Object.entries(getSpecificationSnapshot()).map(([elementName, specification]) => [
            elementName,
            { ...specification, args: null },
        ]),
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
        [key: string]: [string, TElementType, [string, string[]][] | null][];
    } = {};

    Object.entries(_specificationSnapshot).forEach(([elementName, specification]) => {
        const category = specification.category;

        if (!(category in items)) {
            items[category] = [];
        }

        items[category].push([elementName, specification.type, specification.args]);
    });

    /**
     * Generate API.
     */

    const api: string[] = [];

    Object.entries(items).forEach(([category, elements]) => {
        api.push(`# "${category}" elements\n# ------------------------`);
        elements.forEach(([name, type, args]) => {
            if (type === 'Data') {
                api.push(`- [instruction]:\n    [param]:\n      ${name}: string`);
            } else if (type === 'Expression') {
                if (args === null) {
                    // not possible
                } else if (args.length === 1) {
                    api.push(
                        `- [instruction]:\n    ${name}:\n${args
                            .map(([name, types]) => `      ${name}: ${types.join('|')}`)
                            .join('\n')}`,
                    );
                } else {
                    api.push(
                        `- [instruction]:\n    [param]:\n      ${name}:\n${args
                            .map(([name, types]) => `        ${name}: ${types.join('|')}`)
                            .join('\n')}`,
                    );
                }
            } else if (type === 'Statement') {
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
            } else if (type === 'Block') {
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
    let instructions: ICodeInstruction[];

    function __verifyStructureValidity(): boolean {
        try {
            instructions = yamlToJson(code) as ICodeInstruction[];
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
        function __findSingleArgParam(instruction: string): string {
            const args = _specificationSnapshot[instruction].args;
            if (args === null) {
                throw new InvalidArgumentError(`"${instruction}" does not take arguments`);
            } else if (args.length !== 1) {
                throw new InvalidArgumentError(
                    `"${instruction}" takes ${args.length} arguments but only 1 argument supplied`,
                );
            }

            return args[0][0];
        }

        function __verifyArgParams(instruction: string, argObj: ICodeArgument): void {
            const args = _specificationSnapshot[instruction].args;

            if (args === null) {
                throw new InvalidArgumentError(`"${instruction}" does not take arguments`);
            }

            const isBlock = _specificationSnapshot[instruction].type === 'Block';

            const exptParams = args.map(([param, _]) => param);
            const origParams = Object.keys(argObj);

            if (isBlock) {
                if (!origParams.includes('scope')) {
                    throw new InvalidInstructionError(`"${instruction}" expects a scope`);
                }

                if (!((argObj as ICodeArgumentObj)['scope'] instanceof Array)) {
                    throw new InvalidInstructionError(
                        `"${instruction}" supplied with invalid scope`,
                    );
                }

                exptParams.push('scope');
            }

            if (exptParams.length !== origParams.length) {
                throw new InvalidArgumentError(
                    `invalid number of arguments supplied for "${instruction}"`,
                );
            }

            if (exptParams.filter((param) => !origParams.includes(param)).length !== 0) {
                throw new InvalidArgumentError(`invalid arguments supplied for "${instruction}"`);
            }
        }

        function __buildInputSnapshotArgument(
            instruction: string,
            param: string,
            codeArgument: ICodeArgument,
        ): ITreeSnapshotDataInput | ITreeSnapshotExpressionInput {
            // code argument is a literal
            if (typeof codeArgument !== 'object') {
                return {
                    elementName:
                        typeof codeArgument === 'boolean'
                            ? 'value-boolean'
                            : typeof codeArgument === 'number'
                            ? 'value-number'
                            : 'value-string',
                    value: codeArgument.toString(),
                };
            }

            if (Object.keys(codeArgument).length !== 1) {
                throw new InvalidArgumentError(
                    `invalid argument for parameter "${param}" of "${instruction}"`,
                );
            }

            // there's only one arg element
            const [argElem, args] = Object.entries(codeArgument)[0];

            // single arg but supplied as key-value pair
            if (param === argElem) {
                return __buildInputSnapshotArgument(instruction, param, args);
            }

            if (!(argElem in _specificationSnapshot)) {
                throw new InvalidInstructionError(
                    `"${argElem}" is not a valid argument for "${argElem}"`,
                );
            }

            const specification = _specificationSnapshot[argElem];
            if (specification.type === 'Data') {
                if (typeof args === 'string') {
                    return {
                        elementName: argElem,
                        value: args,
                    };
                }

                throw new InvalidArgumentError(`invalid argument for 'Data' element "${argElem}"`);
            } else if (specification.type === 'Expression') {
                const treeSnapshotInputArgument: ITreeSnapshotExpressionInput = {
                    elementName: '',
                    argMap: null,
                };

                treeSnapshotInputArgument.elementName = argElem;

                // single arg
                if (typeof args !== 'object' || Object.keys(args).length === 1) {
                    // can throw error
                    const param = __findSingleArgParam(argElem);

                    treeSnapshotInputArgument.argMap = Object.fromEntries([
                        [param, __buildInputSnapshotArgument(argElem, param, args)],
                    ]);
                }
                // multiple args
                else {
                    // can throw error
                    __verifyArgParams(argElem, args);

                    treeSnapshotInputArgument.argMap = Object.fromEntries(
                        Object.entries(args).map(([param, arg]) => [
                            param,
                            __buildInputSnapshotArgument(argElem, param, arg),
                        ]),
                    );
                }

                return treeSnapshotInputArgument;
            } else {
                throw new InvalidArgumentError(
                    `"${argElem}" is not a 'Data' or 'Expression' element`,
                );
            }
        }

        function __buildInputSnapshotInstruction(
            codeInstruction: ICodeInstruction,
        ): ITreeSnapshotStatementInput | ITreeSnapshotBlockInput {
            // code instruction is a string
            if (typeof codeInstruction === 'string') {
                if (!(codeInstruction in _specificationSnapshot)) {
                    throw new InvalidInstructionError(
                        `"${codeInstruction}" is not a valid instruction`,
                    );
                }

                return {
                    elementName: codeInstruction,
                    argMap: null,
                };
            }
            // code instruction is an object
            else {
                if (Object.keys(codeInstruction).length !== 1) {
                    throw new InvalidInstructionError('wrong instruction format encountered');
                }

                // there's only one instruction
                const [instruction, args] = Object.entries(codeInstruction)[0];

                if (!(instruction in _specificationSnapshot)) {
                    throw new InvalidInstructionError(
                        `"${codeInstruction}" is not a valid instruction`,
                    );
                }

                const treeSnapshotInputInstruction:
                    | ITreeSnapshotStatementInput
                    | ITreeSnapshotBlockInput = {
                    elementName: '',
                    argMap: null,
                };

                treeSnapshotInputInstruction.elementName = instruction;

                // single arg
                if (typeof args !== 'object' || Object.keys(args).length === 1) {
                    // can throw error
                    const param = __findSingleArgParam(instruction);

                    treeSnapshotInputInstruction.argMap = Object.fromEntries([
                        [param, __buildInputSnapshotArgument(instruction, param, args)],
                    ]);
                }
                // multiple args
                else {
                    // can throw error
                    __verifyArgParams(instruction, args);

                    treeSnapshotInputInstruction.argMap = Object.fromEntries(
                        Object.entries(args)
                            .filter(([param, _]) => param !== 'scope')
                            .map(([param, arg]) => [
                                param,
                                __buildInputSnapshotArgument(instruction, param, arg),
                            ]),
                    );

                    if ('scope' in args) {
                        (treeSnapshotInputInstruction as ITreeSnapshotBlockInput).scope = (
                            args['scope'] as unknown as ICodeInstruction[]
                        ).map((item) => __buildInputSnapshotInstruction(item));
                    }
                }

                return treeSnapshotInputInstruction;
            }
        }

        const snapshot: ITreeSnapshotInput = {
            process: [],
            routine: [],
            crumbs: [
                (instructions as ICodeInstruction[]).map((instruction) =>
                    __buildInputSnapshotInstruction(instruction),
                ),
            ],
        };

        generateFromSnapshot(snapshot);
    }

    return new Promise((resolve) => {
        if (__verifyStructureValidity() === false) {
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
