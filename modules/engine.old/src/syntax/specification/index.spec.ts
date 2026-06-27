import type { IElementSpecificationData } from '../../@types/specification';
import type { TData } from '../../@types/data';

import {
    registerElementSpecificationEntry,
    registerElementSpecificationEntries,
    queryElementSpecification,
    removeElementSpecificationEntry,
    removeElementSpecificationEntries,
    resetElementSpecificationTable,
    getSpecificationSnapshot,
    checkValueAssignment,
} from '.';

import elementSpecificationEntries from '../../library';

import { ElementData, ElementExpression } from '../elements/elementArgument';
import { ElementStatement, ElementBlock } from '../elements/elementInstruction';

// -------------------------------------------------------------------------------------------------

abstract class ElementDataCover extends ElementData<TData> {}
abstract class ElementExpressionCover extends ElementExpression<TData> {}

registerElementSpecificationEntries(elementSpecificationEntries);

describe('Syntax Element Specification', () => {
    describe('element specifications', () => {
        describe('data element', () => {
            const dataElementEntry = queryElementSpecification('value-boolean')!;
            expect(dataElementEntry.label).toBe('true');

            test('fetch element and verify entry', () => {
                expect(dataElementEntry.classification.group).toBe('programming');
                expect(dataElementEntry.classification.category).toBe('value');
                expect(dataElementEntry.type).toBe('Data');
            });

            test('instantiate prototype fetch from entry query and verify instance', () => {
                const prototype = dataElementEntry.prototype as (
                    name: string,
                    label: string,
                ) => ElementDataCover;
                const elementInstance = prototype('value-boolean', dataElementEntry.label);
                expect(elementInstance.name).toBe('value-boolean');
                expect(elementInstance.kind).toBe('Argument');
                expect(elementInstance.type).toBe('Data');
            });
        });

        describe('expression element', () => {
            const dataElementEntry = queryElementSpecification('operator-math-plus')!;

            test('fetch element and verify entry', () => {
                expect(dataElementEntry.classification.group).toBe('programming');
                expect(dataElementEntry.classification.category).toBe('operator-math');
                expect(dataElementEntry.label).toBe('+');
                expect(dataElementEntry.type).toBe('Expression');
            });

            test('instantiate prototype fetch from entry query and verify instance', () => {
                const prototype = dataElementEntry.prototype as (
                    name: string,
                    label: string,
                ) => ElementExpressionCover;
                const elementInstance = prototype('operator-math-plus', dataElementEntry.label);
                expect(elementInstance.name).toBe('operator-math-plus');
                expect(elementInstance.kind).toBe('Argument');
                expect(elementInstance.type).toBe('Expression');
            });
        });

        describe('statement element', () => {
            const dataElementEntry = queryElementSpecification('box-generic')!;

            test('fetch element and verify entry', () => {
                expect(dataElementEntry.classification.group).toBe('programming');
                expect(dataElementEntry.classification.category).toBe('box');
                expect(dataElementEntry.label).toBe('Box');
                expect(dataElementEntry.type).toBe('Statement');
            });

            test('instantiate prototype fetch from entry query and verify instance', () => {
                const prototype = dataElementEntry.prototype as (
                    name: string,
                    label: string,
                ) => ElementStatement;
                const elementInstance = prototype('box-generic', dataElementEntry.label);
                expect(elementInstance.name).toBe('box-generic');
                expect(elementInstance.kind).toBe('Instruction');
                expect(elementInstance.type).toBe('Statement');
            });
        });

        describe('block element', () => {
            const dataElementEntry = queryElementSpecification('process')!;

            test('fetch element and verify entry', () => {
                expect(dataElementEntry.classification.group).toBe('programming');
                expect(dataElementEntry.classification.category).toBe('program');
                expect(dataElementEntry.label).toBe('start');
                expect(dataElementEntry.type).toBe('Block');
            });

            test('instantiate prototype fetch from entry query and verify instance', () => {
                const prototype = dataElementEntry.prototype as (
                    name: string,
                    label: string,
                ) => ElementBlock;
                const elementInstance = prototype('process', dataElementEntry.label);
                expect(elementInstance.name).toBe('process');
                expect(elementInstance.kind).toBe('Instruction');
                expect(elementInstance.type).toBe('Block');
            });
        });
    });

    describe('functions', () => {
        class DummyElementData extends ElementData<TData> {
            constructor(name: string, label: string) {
                super(name, label, {}, ['number'], 0);
            }
            public evaluate(): void {
                1;
            }
        }

        class DummyElementExpression extends ElementExpression<TData> {
            constructor(name: string, label: string) {
                super(name, label, {}, ['number'], 0);
            }
            public evaluate(): void {
                1;
            }
        }

        class DummyElementStatement extends ElementStatement {
            constructor(name: string, label: string) {
                super(name, label, {});
            }
            public onVisit(): void {
                1;
            }
        }

        class DummyElementBlock extends ElementBlock {
            constructor(name: string, label: string) {
                super(name, label, {});
            }
            public onVisit(): void {
                1;
            }
            public onInnerVisit(): void {
                1;
            }
            public onInnerExit(): void {
                1;
            }
            public onExit(): void {
                1;
            }
        }

        test('register new element specification entry and verify', () => {
            const status = registerElementSpecificationEntry('group', 'dummy0', {
                category: 'dummy',
                label: 'dummy0',
                type: 'Data',
                prototype: DummyElementData,
                values: { types: ['boolean'] },
            });
            expect(status).toBe(true);

            const elementEntry = queryElementSpecification('dummy0')!;
            expect(elementEntry.classification.group).toBe('group');
            expect(elementEntry.classification.category).toBe('dummy');
            expect(elementEntry.label).toBe('dummy0');
            expect(elementEntry.type).toBe('Data');
            expect(
                (elementEntry.prototype as (name: string, label: string) => ElementDataCover)(
                    'dummy0',
                    'dummy0',
                ) instanceof DummyElementData,
            ).toBe(true);
            expect('values' in elementEntry).toBe(true);
            expect((elementEntry as IElementSpecificationData).values).toEqual({
                types: ['boolean'],
            });
        });

        test('register duplicate element specification entry and verify', () => {
            const status = registerElementSpecificationEntry('group', 'dummy0', {
                category: 'dummy',
                label: 'dummy0',
                type: 'Block',
                prototype: DummyElementBlock,
            });
            expect(status).toBe(false);
        });

        test('register new element specification entries and verify', () => {
            const status = registerElementSpecificationEntries({
                group: {
                    entries: {
                        dummy1: {
                            category: 'dummy',
                            label: 'dummy1',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: ['1', '2', '3'],
                        },
                        dummy2: {
                            category: 'dummy',
                            label: 'dummy2',
                            type: 'Expression',
                            prototype: DummyElementExpression,
                        },
                        dummy3: {
                            category: 'dummy',
                            label: 'dummy3',
                            type: 'Statement',
                            prototype: DummyElementStatement,
                        },
                        dummy4: {
                            category: 'dummy',
                            label: 'dummy4',
                            type: 'Block',
                            prototype: DummyElementBlock,
                        },
                    },
                    context: {},
                },
            });
            expect(Object.keys(status).length).toBe(1);
            expect(
                Object.entries(status['group'])
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                    .map(([key, value]) => `${key}-${value}`),
            ).toEqual(['dummy1-true', 'dummy2-true', 'dummy3-true', 'dummy4-true']);

            const elementEntry1 = queryElementSpecification('dummy1')!;
            const elementEntry2 = queryElementSpecification('dummy2')!;
            const elementEntry3 = queryElementSpecification('dummy3')!;
            const elementEntry4 = queryElementSpecification('dummy4')!;

            expect(elementEntry1.classification.group).toBe('group');
            expect(elementEntry1.classification.category).toBe('dummy');
            expect(elementEntry1.label).toBe('dummy1');
            expect(elementEntry1.type).toBe('Data');
            expect(
                (elementEntry1.prototype as (name: string, label: string) => ElementDataCover)(
                    'dummy1',
                    'dummy1',
                ) instanceof DummyElementData,
            ).toBe(true);
            expect('values' in elementEntry1).toBe(true);
            expect((elementEntry1 as IElementSpecificationData).values).toEqual(['1', '2', '3']);

            expect(elementEntry2.classification.group).toBe('group');
            expect(elementEntry2.classification.category).toBe('dummy');
            expect(elementEntry2.label).toBe('dummy2');
            expect(elementEntry2.type).toBe('Expression');
            expect(
                (
                    elementEntry2.prototype as (
                        name: string,
                        label: string,
                    ) => ElementExpressionCover
                )('dummy2', 'dummy2') instanceof DummyElementExpression,
            ).toBe(true);

            expect(elementEntry3.classification.group).toBe('group');
            expect(elementEntry3.classification.category).toBe('dummy');
            expect(elementEntry3.label).toBe('dummy3');
            expect(elementEntry3.type).toBe('Statement');
            expect(
                (elementEntry3.prototype as (name: string, label: string) => ElementStatement)(
                    'dummy3',
                    'dummy3',
                ) instanceof DummyElementStatement,
            ).toBe(true);

            expect(elementEntry4.classification.group).toBe('group');
            expect(elementEntry4.classification.category).toBe('dummy');
            expect(elementEntry4.label).toBe('dummy4');
            expect(elementEntry4.type).toBe('Block');
            expect(
                (elementEntry4.prototype as (name: string, label: string) => ElementBlock)(
                    'dummy4',
                    'dummy4',
                ) instanceof DummyElementBlock,
            ).toBe(true);
        });

        test('register duplicate element specification entries and verify', () => {
            const status = registerElementSpecificationEntries({
                group: {
                    entries: {
                        dummy1: {
                            category: 'dummy',
                            label: 'dummy1',
                            type: 'Data',
                            prototype: DummyElementData,
                        },
                        dummy2: {
                            category: 'dummy',
                            label: 'dummy2',
                            type: 'Expression',
                            prototype: DummyElementExpression,
                        },
                        dummy3: {
                            category: 'dummy',
                            label: 'dummy3',
                            type: 'Statement',
                            prototype: DummyElementStatement,
                        },
                        dummy4: {
                            category: 'dummy',
                            label: 'dummy4',
                            type: 'Block',
                            prototype: DummyElementBlock,
                        },
                    },
                    context: {},
                },
            });
            expect(Object.keys(status).length).toBe(1);
            expect(
                Object.entries(status['group'])
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                    .map(([key, value]) => `${key}-${value}`),
            ).toEqual(['dummy1-false', 'dummy2-false', 'dummy3-false', 'dummy4-false']);
        });

        test('remove valid element specification entry and verify', () => {
            const removeStatus = removeElementSpecificationEntry('dummy0');
            const elementEntry = queryElementSpecification('dummy0')!;

            expect(removeStatus).toBe(true);
            expect(elementEntry).toBe(null);
        });

        test('remove invalid element specification entry and verify', () => {
            const removeStatus = removeElementSpecificationEntry('dummy0');
            const elementEntry = queryElementSpecification('dummy0')!;

            expect(removeStatus).toBe(false);
            expect(elementEntry).toBe(null);
        });

        test('remove valid element specification entries and verify', () => {
            const removeStatus = removeElementSpecificationEntries([
                'dummy1',
                'dummy2',
                'dummy3',
                'dummy4',
            ]);
            expect(removeStatus).toEqual([true, true, true, true]);
            expect(queryElementSpecification('dummy1')!).toBe(null);
            expect(queryElementSpecification('dummy2')!).toBe(null);
            expect(queryElementSpecification('dummy3')!).toBe(null);
            expect(queryElementSpecification('dummy4')!).toBe(null);
        });

        test('remove invalid element specification entries and verify', () => {
            const removeStatus = removeElementSpecificationEntries([
                'dummy1',
                'dummy2',
                'dummy3',
                'dummy4',
            ]);
            expect(removeStatus).toEqual([false, false, false, false]);
            expect(queryElementSpecification('dummy1')!).toBe(null);
            expect(queryElementSpecification('dummy2')!).toBe(null);
            expect(queryElementSpecification('dummy3')!).toBe(null);
            expect(queryElementSpecification('dummy4')!).toBe(null);
        });

        test('reset element specification table and verify', () => {
            resetElementSpecificationTable();
            expect(queryElementSpecification('dummy3')!).toBe(null);
            expect(queryElementSpecification('dummy4')!).toBe(null);
        });

        test('generate snapshot and verify', () => {
            registerElementSpecificationEntries(elementSpecificationEntries);
            expect(
                Object.entries(getSpecificationSnapshot()).map(([key, value]) => [
                    key,
                    value.prototypeName,
                ]),
            ).toEqual([
                ['value-boolean', 'ElementValueBoolean'],
                ['value-number', 'ElementValueNumber'],
                ['value-string', 'ElementValueString'],
                ['box-generic', 'ElementBoxGeneric'],
                ['box-boolean', 'ElementBoxBoolean'],
                ['box-number', 'ElementBoxNumber'],
                ['box-string', 'ElementBoxString'],
                ['boxidentifier-generic', 'ElementBoxIdentifierGeneric'],
                ['boxidentifier-boolean', 'ElementBoxIdentifierBoolean'],
                ['boxidentifier-number', 'ElementBoxIdentifierNumber'],
                ['boxidentifier-string', 'ElementBoxIdentifierString'],
                ['operator-math-plus', 'ElementOperatorMathPlus'],
                ['operator-math-minus', 'ElementOperatorMathMinus'],
                ['operator-math-times', 'ElementOperatorMathTimes'],
                ['operator-math-divide', 'ElementOperatorMathDivide'],
                ['operator-math-modulus', 'ElementOperatorMathModulus'],
                ['repeat', 'ElementRepeat'],
                ['if', 'ElementIf'],
                ['process', 'ElementProcess'],
                ['routine', 'ElementRoutine'],
                ['print', 'ElementPrint'],
            ]);

            resetElementSpecificationTable();
            expect(getSpecificationSnapshot()).toEqual({});

            registerElementSpecificationEntries({
                group: {
                    entries: {
                        dummy: {
                            category: 'dummy',
                            label: 'dummy',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: ['1', '2', '3'],
                        },
                    },
                    context: {},
                },
            });
            expect(getSpecificationSnapshot()['dummy'].values).toEqual(['1', '2', '3']);
        });

        test('check against specification valid value assignment', () => {
            resetElementSpecificationTable();
            registerElementSpecificationEntries({
                group: {
                    entries: {
                        dummy1: {
                            category: 'dummy',
                            label: 'dummy1',
                            type: 'Data',
                            prototype: DummyElementData,
                        },
                        dummy2: {
                            category: 'dummy',
                            label: 'dummy2',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: ['1', '2', '3'],
                        },
                        dummy3: {
                            category: 'dummy',
                            label: 'dummy3',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: { types: ['boolean'] },
                        },
                        dummy4: {
                            category: 'dummy',
                            label: 'dummy4',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: { types: ['number'] },
                        },
                        dummy5: {
                            category: 'dummy',
                            label: 'dummy5',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: { types: ['string'] },
                        },
                    },
                    context: {},
                },
            });

            expect(checkValueAssignment('dummy1', 'foobar')).toBe(true);
            expect(checkValueAssignment('dummy2', '2')).toBe(true);
            expect(checkValueAssignment('dummy3', 'true')).toBe(true);
            expect(checkValueAssignment('dummy4', '55')).toBe(true);
            expect(checkValueAssignment('dummy5', 'true')).toBe(true);
            expect(checkValueAssignment('dummy5', '55')).toBe(true);
            expect(checkValueAssignment('dummy5', 'foobar')).toBe(true);
        });

        test('check against specification invalid value assignment', () => {
            resetElementSpecificationTable();
            registerElementSpecificationEntries({
                group: {
                    entries: {
                        dummy1: {
                            category: 'dummy',
                            label: 'dummy1',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: ['1', '2', '3'],
                        },
                        dummy2: {
                            category: 'dummy',
                            label: 'dummy2',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: { types: ['boolean'] },
                        },
                        dummy3: {
                            category: 'dummy',
                            label: 'dummy3',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: { types: ['boolean'] },
                        },
                        dummy4: {
                            category: 'dummy',
                            label: 'dummy4',
                            type: 'Data',
                            prototype: DummyElementData,
                            values: { types: ['number'] },
                        },
                    },
                    context: {},
                },
            });

            expect(checkValueAssignment('dummy1', '4')).toBe(false);
            expect(checkValueAssignment('dummy2', '5')).toBe(false);
            expect(checkValueAssignment('dummy3', '5')).toBe(false);
            expect(checkValueAssignment('dummy4', 'true')).toBe(false);
        });
    });
});
