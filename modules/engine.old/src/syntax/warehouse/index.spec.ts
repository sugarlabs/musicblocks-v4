import {
    addInstance,
    getInstance,
    removeInstance,
    getClassificationCount,
    getClassificationCountAll,
    getNameCount,
    getNameCountAll,
    getKindCount,
    getKindCountAll,
    getTypeCount,
    getTypeCountAll,
    resetWarehouse,
} from '.';

import { ElementBlock } from '../elements/elementInstruction';

import { registerElementSpecificationEntries } from '../specification';
import elementSpecificationEntries from '../../library';

import { ElementBoxBoolean } from '../../library/elements/elementBox';
import { ElementOperatorMathPlus } from '../../library/elements/elementOperatorMath';
import { ElementValueBoolean } from '../../library/elements/elementValue';

// -------------------------------------------------------------------------------------------------

registerElementSpecificationEntries(elementSpecificationEntries);
resetWarehouse();

describe('Syntax Element Warehouse', () => {
    let instanceID1: string;
    let instanceID2: string;
    let instanceID3: string;
    let instanceID4: string;

    describe('adding instance', () => {
        test('add an instance of a data element', () => {
            instanceID1 = addInstance('value-boolean');
            expect(typeof instanceID1).toBe('string');
        });

        test('add an instance of an expression element', () => {
            instanceID2 = addInstance('operator-math-plus');
            expect(typeof instanceID2).toBe('string');
        });

        test('add an instance of a statement element', () => {
            instanceID3 = addInstance('box-boolean');
            expect(typeof instanceID3).toBe('string');
        });

        test('add an instance of a block element', () => {
            instanceID4 = addInstance('process');
            expect(typeof instanceID4).toBe('string');
        });
    });

    describe('fetching instance', () => {
        test('fetch instance with invalid instance ID and expect null', () => {
            expect(getInstance(instanceID1 + '00')).toBe(null);
        });

        test('fetch instance of a data element with valid instance ID and verify', () => {
            const {
                classification: { group, category },
                name,
                kind,
                type,
                instance,
            } = getInstance(instanceID1)!;
            expect(group).toBe('programming');
            expect(category).toBe('value');
            expect(name).toBe('value-boolean');
            expect(kind).toBe('Argument');
            expect(type).toBe('Data');
            expect(instance instanceof ElementValueBoolean);
        });

        test('fetch instance of an expression element with valid instance ID and verify', () => {
            const {
                classification: { group, category },
                name,
                kind,
                type,
                instance,
            } = getInstance(instanceID2)!;
            expect(group).toBe('programming');
            expect(category).toBe('operator-math');
            expect(name).toBe('operator-math-plus');
            expect(kind).toBe('Argument');
            expect(type).toBe('Expression');
            expect(instance instanceof ElementOperatorMathPlus);
        });

        test('fetch instance of a statement element with valid instance ID and verify', () => {
            const {
                classification: { group, category },
                name,
                kind,
                type,
                instance,
            } = getInstance(instanceID3)!;
            expect(group).toBe('programming');
            expect(category).toBe('box');
            expect(name).toBe('box-boolean');
            expect(kind).toBe('Instruction');
            expect(type).toBe('Statement');
            expect(instance instanceof ElementBoxBoolean);
        });

        test('fetch instance of a block element with valid instance ID and verify', () => {
            const {
                classification: { group, category },
                name,
                kind,
                type,
                instance,
            } = getInstance(instanceID4)!;
            expect(group).toBe('programming');
            expect(category).toBe('program');
            expect(name).toBe('process');
            expect(kind).toBe('Instruction');
            expect(type).toBe('Block');
            expect(instance instanceof ElementBlock);
        });
    });

    describe('get stats', () => {
        addInstance('value-boolean');
        addInstance('boxidentifier-boolean');
        addInstance('operator-math-divide');
        addInstance('box-number');

        test('verify classification count', () => {
            expect(getClassificationCount('programming', 'value')).toBe(2);
            expect(getClassificationCount('programming', 'boxidentifier')).toBe(1);
            expect(getClassificationCount('programming', 'operator-math')).toBe(2);
            expect(getClassificationCount('programming', 'box')).toBe(2);
            expect(getClassificationCount('programming', 'program')).toBe(1);
        });

        test('verify classification count all', () => {
            const classificationCount = getClassificationCountAll();
            expect(Object.keys(classificationCount).length).toBe(1);
            [
                ['value', 2],
                ['boxidentifier', 1],
                ['operator-math', 2],
                ['box', 2],
                ['program', 1],
            ].forEach(([key, value]) =>
                expect(classificationCount['programming'][key]).toBe(value),
            );
        });

        test('verify name count', () => {
            expect(getNameCount('value-boolean')).toBe(2);
            expect(getNameCount('value-number')).toBe(0);
        });

        test('verify name count all', () => {
            expect(new Set(Object.entries(getNameCountAll()))).toEqual(
                new Set([
                    ['value-boolean', 2],
                    ['operator-math-plus', 1],
                    ['box-boolean', 1],
                    ['process', 1],
                    ['boxidentifier-boolean', 1],
                    ['operator-math-divide', 1],
                    ['box-number', 1],
                ]),
            );
        });

        test('verify kind count', () => {
            expect(getKindCount('Argument')).toBe(5);
            expect(getKindCount('Instruction')).toBe(3);
        });

        test('verify kind count all', () => {
            expect(new Set(Object.entries(getKindCountAll()))).toEqual(
                new Set([
                    ['Argument', 5],
                    ['Instruction', 3],
                ]),
            );
        });

        test('verify type count', () => {
            expect(getTypeCount('Data')).toBe(3);
            expect(getTypeCount('Expression')).toBe(2);
            expect(getTypeCount('Statement')).toBe(2);
            expect(getTypeCount('Block')).toBe(1);
        });

        test('verify type count all', () => {
            expect(new Set(Object.entries(getTypeCountAll()))).toEqual(
                new Set([
                    ['Data', 3],
                    ['Expression', 2],
                    ['Statement', 2],
                    ['Block', 1],
                ]),
            );
        });
    });

    describe('removing instance', () => {
        test('remove an existing instance ID and verify', () => {
            removeInstance(instanceID1);
            expect(getInstance(instanceID1)).toBe(null);
            expect(getClassificationCount('programming', 'value')).toBe(1);
            expect(getClassificationCount('programming', 'boxidentifier')).toBe(1);
            expect(getClassificationCount('programming', 'operator-math')).toBe(2);
            expect(getClassificationCount('programming', 'box')).toBe(2);
            expect(getClassificationCount('programming', 'program')).toBe(1);
            expect(getNameCount('value-boolean')).toBe(1);
            expect(getKindCount('Argument')).toBe(4);
            expect(getKindCount('Instruction')).toBe(3);
            expect(getTypeCount('Data')).toBe(2);
            expect(getTypeCount('Expression')).toBe(2);
            expect(getTypeCount('Statement')).toBe(2);
            expect(getTypeCount('Block')).toBe(1);
        });
    });

    describe('reset', () => {
        function _checkEmpty(table: { [key: string]: number }): boolean {
            return Object.values(table).length === 0
                ? true
                : Object.values(table).reduce((a, b) => a + b) === 0;
        }

        test('reset warehouse and verify from stats', () => {
            resetWarehouse();
            {
                let count = 0;
                Object.values(getClassificationCountAll()).forEach(
                    (categoryMap) => (count += Object.values(categoryMap).reduce((a, b) => a + b)),
                );
                expect(count).toBe(0);
            }
            expect(_checkEmpty(getNameCountAll())).toBe(true);
            expect(_checkEmpty(getKindCountAll())).toBe(true);
            expect(_checkEmpty(getTypeCountAll())).toBe(true);
        });
    });
});
