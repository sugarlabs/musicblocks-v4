import type { ITreeSnapshotInput } from '../../@types/syntaxTree';

import {
    addNode,
    getNode,
    removeNode,
    attachArgumentCheck,
    attachArgument,
    detachArgument,
    attachInstructionBelowCheck,
    attachInstructionBelow,
    detachInstructionBelow,
    attachInstructionInsideCheck,
    attachInstructionInside,
    detachInstructionInside,
    generateSnapshot,
    generateFromSnapshot,
    resetSyntaxTree,
    assignNodeValue,
} from '.';
import { TreeNodeData, TreeNodeStatement, TreeNodeBlock } from './node';
import { getInstance } from '../warehouse';

import { registerElementSpecificationEntries } from '../specification';
import elementSpecificationEntries from '../../library';

import { ElementProcess, ElementRoutine } from '../../library/elements/elementProgram';
import { ElementValueBoolean } from '../../library/elements/elementValue';
import { ElementOperatorMathPlus } from '../../library/elements/elementOperatorMath';
import { ElementBoxBoolean } from '../../library/elements/elementBox';

// -------------------------------------------------------------------------------------------------

registerElementSpecificationEntries(elementSpecificationEntries);

describe('Syntax Tree', () => {
    let process: string;
    let routine: string;
    let data: string;
    let expression: string;
    let statement: string;
    let block: string;

    describe('adding elements', () => {
        process = addNode('process');
        test('add process element and verify', () => {
            const node = getNode(process)!;
            expect(node.elementName).toBe('process');
            const instance = getInstance(node.instanceID)!;
            expect(instance.classification.group).toBe('programming');
            expect(instance.classification.category).toBe('program');
            expect(instance.name).toBe('process');
            expect(instance.kind).toBe('Instruction');
            expect(instance.type).toBe('Block');
            expect(instance.instance instanceof ElementProcess).toBe(true);
        });

        routine = addNode('routine');
        test('add routine element and verify', () => {
            const node = getNode(routine)!;
            expect(node.elementName).toBe('routine');
            const instance = getInstance(node.instanceID)!;
            expect(instance.classification.group).toBe('programming');
            expect(instance.classification.category).toBe('program');
            expect(instance.name).toBe('routine');
            expect(instance.kind).toBe('Instruction');
            expect(instance.type).toBe('Block');
            expect(instance.instance instanceof ElementRoutine).toBe(true);
        });

        data = addNode('value-boolean');
        test('add data element and verify', () => {
            const node = getNode(data)!;
            expect(node.elementName).toBe('value-boolean');
            const instance = getInstance(node.instanceID)!;
            expect(instance.classification.group).toBe('programming');
            expect(instance.classification.category).toBe('value');
            expect(instance.name).toBe('value-boolean');
            expect(instance.kind).toBe('Argument');
            expect(instance.type).toBe('Data');
            expect(instance.instance instanceof ElementValueBoolean).toBe(true);
        });

        expression = addNode('operator-math-plus');
        test('add expression element and verify', () => {
            const node = getNode(expression)!;
            expect(node.elementName).toBe('operator-math-plus');
            const instance = getInstance(node.instanceID)!;
            expect(instance.classification.group).toBe('programming');
            expect(instance.classification.category).toBe('operator-math');
            expect(instance.name).toBe('operator-math-plus');
            expect(instance.kind).toBe('Argument');
            expect(instance.type).toBe('Expression');
            expect(instance.instance instanceof ElementOperatorMathPlus).toBe(true);
        });

        statement = addNode('box-boolean');
        test('add statement element and verify', () => {
            const node = getNode(statement)!;
            expect(node.elementName).toBe('box-boolean');
            const instance = getInstance(node.instanceID)!;
            expect(instance.classification.group).toBe('programming');
            expect(instance.classification.category).toBe('box');
            expect(instance.name).toBe('box-boolean');
            expect(instance.kind).toBe('Instruction');
            expect(instance.type).toBe('Statement');
            expect(instance.instance instanceof ElementBoxBoolean).toBe(true);
        });

        block = addNode('routine');
        test('add block element and verify', () => {
            const node = getNode(block)!;
            expect(node.elementName).toBe('routine');
            const instance = getInstance(node.instanceID)!;
            expect(instance.classification.group).toBe('programming');
            expect(instance.classification.category).toBe('program');
            expect(instance.name).toBe('routine');
            expect(instance.kind).toBe('Instruction');
            expect(instance.type).toBe('Block');
            expect(instance.instance instanceof ElementRoutine).toBe(true);
        });
    });

    describe('removing elements', () => {
        test('remove process element and verify', () => {
            const instanceID = getNode(process)!.instanceID;
            expect(getInstance(instanceID)).not.toBe(null);
            removeNode(process);
            expect(getNode(process)).toBe(null);
            expect(getInstance(instanceID)).toBe(null);
        });

        test('remove routine element and verify', () => {
            const instanceID = getNode(routine)!.instanceID;
            expect(getInstance(instanceID)).not.toBe(null);
            removeNode(routine);
            expect(getNode(routine)).toBe(null);
            expect(getInstance(instanceID)).toBe(null);
        });

        test('remove element and verify', () => {
            const instanceID = getNode(block)!.instanceID;
            expect(getInstance(instanceID)).not.toBe(null);
            removeNode(block);
            expect(getNode(block)).toBe(null);
            expect(getInstance(instanceID)).toBe(null);
        });
    });

    const boxBoolean = addNode('box-boolean');
    const valueBoolean = addNode('value-boolean');
    const valueNumber = addNode('value-number');

    const processX = addNode('process');
    const boxBooleanX = addNode('box-boolean');
    const boxNumberX = addNode('box-number');
    const processNodeX = getNode(processX) as TreeNodeBlock;
    const boxBooleanNodeX = getNode(boxBooleanX) as TreeNodeStatement | TreeNodeBlock;
    const boxNumberNodeX = getNode(boxNumberX) as TreeNodeStatement | TreeNodeBlock;

    describe('attaching elements', () => {
        describe('attaching arguments', () => {
            test('verify argument attachment checking', () => {
                expect(attachArgumentCheck(boxBoolean, valueNumber, 'value')).toBe(false);
                expect(attachArgumentCheck(boxBoolean, valueBoolean, 'value')).toBe(true);
                expect(attachArgumentCheck(boxBoolean, valueNumber, 'foo')).toBe(false);
            });

            test('verify argument attachment to instruction', () => {
                attachArgument(boxBoolean, valueBoolean, 'value');
                const boxNode = getNode(boxBoolean)!;
                const valueNode = getNode(valueBoolean)!;
                expect((valueNode as TreeNodeData).connectedTo).toEqual(boxNode);
            });
        });

        describe('instruction attachment', () => {
            test('verify attachment below checking', () => {
                expect(attachInstructionBelowCheck(processX, boxBooleanX)).toBe(false);
                expect(attachInstructionBelowCheck(boxBooleanX, boxNumberX)).toBe(true);
            });

            test('verify attachment below', () => {
                attachInstructionBelow(boxBooleanX, boxNumberX);
                expect(boxBooleanNodeX.afterConnection).toEqual(boxNumberNodeX);
                expect(boxNumberNodeX.beforeConnection).toEqual(boxBooleanNodeX);
            });

            test('verify attachment inside checking', () => {
                expect(attachInstructionInsideCheck(processX, boxBooleanX)).toBe(false);
            });

            test('verify attachment inside', () => {
                attachInstructionInside(processX, boxBooleanX);
                expect(processNodeX.innerConnection!.nodeID).toBe(boxBooleanNodeX.nodeID);
                expect(processNodeX.innerCount).toBe(1);
                expect(boxBooleanNodeX.parentBlock!.nodeID).toEqual(processNodeX.nodeID);
                expect(boxBooleanNodeX.nestLevel).toBe(1);
            });
        });
    });

    describe('detaching elements', () => {
        describe('argument detachment', () => {
            test('verify argument detachment', () => {
                const valueNode = getNode(valueBoolean)!;
                detachArgument(boxBoolean, valueBoolean, 'value');
                expect((valueNode as TreeNodeData).connectedTo).toBe(null);
            });
        });

        describe('instruction detachment', () => {
            test('verify detachment instruction below', () => {
                detachInstructionBelow(boxBooleanX, boxNumberX);
                expect(boxBooleanNodeX.afterConnection).toBe(null);
                expect(boxNumberNodeX.beforeConnection).toBe(null);
            });

            test('verify detachment instruction inside', () => {
                detachInstructionInside(processX, boxBooleanX);
                expect(processNodeX.innerConnection).toBe(null);
                expect(processNodeX.innerCount).toBe(0);
                expect(boxBooleanNodeX.parentBlock).toBe(null);
                expect(boxBooleanNodeX.nestLevel).toBe(0);
            });
        });
    });

    describe('snapshot generation', () => {
        test('validate snapshot', () => {
            const snapshot1 = generateSnapshot();
            expect(snapshot1.process.length).toBe(1);
            expect(snapshot1.routine.length).toBe(0);
            expect(snapshot1.crumbs.length).toBe(8);

            attachArgument(boxBoolean, valueBoolean, 'value');
            attachInstructionBelow(boxBooleanX, boxNumberX);
            attachInstructionInside(processX, boxBooleanX);
            const snapshot2 = generateSnapshot();
            expect(snapshot2.process.length).toBe(1);
            expect(snapshot2.routine.length).toBe(0);
            expect(snapshot2.crumbs.length).toBe(5);
        });
    });

    describe('reset tree', () => {
        test('reset syntax tree and verify', () => {
            resetSyntaxTree();
            const snapshot = generateSnapshot();
            expect(snapshot.process.length).toBe(0);
            expect(snapshot.routine.length).toBe(0);
            expect(snapshot.crumbs.length).toBe(0);
        });
    });

    describe('tree generation from snapshot', () => {
        test('validate tree generation without initialisation values', () => {
            const snapshotInput: ITreeSnapshotInput = {
                process: [
                    {
                        elementName: 'process',
                        argMap: null,
                        scope: [
                            {
                                elementName: 'box-number',
                                argMap: {
                                    name: {
                                        elementName: 'value-string',
                                    },
                                    value: {
                                        elementName: 'value-number',
                                    },
                                },
                            },
                            {
                                elementName: 'box-number',
                                argMap: {
                                    name: {
                                        elementName: 'value-string',
                                    },
                                    value: {
                                        elementName: 'operator-math-plus',
                                        argMap: {
                                            operand1: {
                                                elementName: 'value-number',
                                            },
                                            operand2: {
                                                elementName: 'value-number',
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
                routine: [
                    {
                        elementName: 'routine',
                        argMap: {
                            name: {
                                elementName: 'value-string',
                            },
                        },
                        scope: [],
                    },
                ],
                crumbs: [
                    [{ elementName: 'value-boolean' }],
                    [
                        {
                            elementName: 'operator-math-plus',
                            argMap: {
                                operand1: null,
                                operand2: {
                                    elementName: 'value-number',
                                },
                            },
                        },
                    ],
                    [
                        {
                            elementName: 'box-number',
                            argMap: {
                                name: {
                                    elementName: 'value-string',
                                },
                                value: {
                                    elementName: 'operator-math-plus',
                                    argMap: {
                                        operand1: {
                                            elementName: 'value-number',
                                        },
                                        operand2: {
                                            elementName: 'value-number',
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    [
                        {
                            elementName: 'box-boolean',
                            argMap: {
                                name: null,
                                value: null,
                            },
                        },
                        {
                            elementName: 'box-number',
                            argMap: {
                                name: {
                                    elementName: 'value-string',
                                },
                                value: {
                                    elementName: 'operator-math-plus',
                                    argMap: {
                                        operand1: {
                                            elementName: 'value-number',
                                        },
                                        operand2: {
                                            elementName: 'value-number',
                                        },
                                    },
                                },
                            },
                        },
                        {
                            elementName: 'box-boolean',
                            argMap: {
                                name: null,
                                value: {
                                    elementName: 'value-boolean',
                                },
                            },
                        },
                    ],
                ],
            };
            generateFromSnapshot(snapshotInput);
            const snapshotOutput = generateSnapshot();

            /* eslint-disable-next-line */
            function __check(object1: object, object2: object): void {
                if (object1 === null || object1 === undefined) {
                    expect(object1).toBe(object2);
                    return;
                }

                for (const key of Object.keys(object1)) {
                    if (key === 'nodeID') {
                        continue;
                    }

                    // @ts-ignore
                    if (typeof object1[key] !== 'object') {
                        // @ts-ignore
                        expect(object1[key]).toEqual(object2[key]);
                    } else {
                        // @ts-ignore
                        __check(object1[key], object2[key]);
                    }
                }
            }

            for (const i in snapshotInput.process) {
                __check(snapshotInput.process[i], snapshotOutput.process[i]);
            }

            for (const i in snapshotInput.routine) {
                __check(snapshotInput.routine[i], snapshotOutput.routine[i]);
            }

            for (const i in snapshotInput.crumbs) {
                for (const j in snapshotInput.crumbs[i]) {
                    __check(snapshotInput.crumbs[i][j], snapshotOutput.crumbs[i][j]);
                }
            }
        });

        test('validate tree generation with valid initialisation values', () => {
            const snapshotInput: ITreeSnapshotInput = {
                process: [],
                routine: [],
                crumbs: [
                    [
                        {
                            elementName: 'operator-math-plus',
                            argMap: {
                                operand1: null,
                                operand2: {
                                    elementName: 'value-number',
                                    value: '5',
                                },
                            },
                        },
                    ],
                ],
            };
            generateFromSnapshot(snapshotInput);
            const snapshotOutput = generateSnapshot();

            expect(
                getInstance(
                    // @ts-ignore
                    getNode(snapshotOutput.crumbs[0][0].argMap['operand2'].nodeID)!.instanceID,
                )!.instance.label,
            ).toBe('5');
        });

        test('validate tree generation with invalid initialisation values', () => {
            const snapshotInput: ITreeSnapshotInput = {
                process: [],
                routine: [],
                crumbs: [
                    [
                        {
                            elementName: 'operator-math-plus',
                            argMap: {
                                operand1: null,
                                operand2: {
                                    elementName: 'value-number',
                                    value: 'foobar',
                                },
                            },
                        },
                    ],
                ],
            };
            expect(() => {
                generateFromSnapshot(snapshotInput);
            }).toThrowError(
                'InvalidDataError: value "foobar" cannot be assigned to data element "value-number"',
            );
        });
    });

    describe('value assignment to node', () => {
        test('validate invalid attempt to assign value to non-data element', () => {
            generateFromSnapshot({
                process: [],
                routine: [],
                crumbs: [
                    [
                        {
                            elementName: 'operator-math-plus',
                            argMap: {
                                operand1: null,
                                operand2: null,
                            },
                        },
                    ],
                ],
            });
            const snapshot = generateSnapshot();
            expect(assignNodeValue(snapshot.crumbs[0][0].nodeID, 'foobar')).toBe(false);
        });

        test('validate invalid attempt to assign value to non-existing element', () => {
            expect(assignNodeValue('123456', 'foobar')).toBe(false);
        });

        test('validate valid attempt to assign invalid value to data element', () => {
            generateFromSnapshot({
                process: [],
                routine: [],
                crumbs: [
                    [
                        {
                            elementName: 'value-number',
                        },
                    ],
                ],
            });
            const snapshot = generateSnapshot();
            expect(assignNodeValue(snapshot.crumbs[0][0].nodeID, 'foobar')).toBe(false);
        });

        test('validate valid attempt to assign valid value to data element', () => {
            generateFromSnapshot({
                process: [],
                routine: [],
                crumbs: [
                    [
                        {
                            elementName: 'value-boolean',
                        },
                    ],
                ],
            });
            const snapshot = generateSnapshot();
            expect(assignNodeValue(snapshot.crumbs[0][0].nodeID, 'true')).toBe(true);
        });
    });
});
