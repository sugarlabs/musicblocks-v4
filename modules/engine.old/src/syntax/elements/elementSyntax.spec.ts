import type { TDataName } from '../../@types/data';

import { ElementSyntax } from './elementSyntax';

// -------------------------------------------------------------------------------------------------

class DummyElementSyntax extends ElementSyntax {
    constructor(
        name: string,
        label: string,
        kind: 'Argument' | 'Instruction',
        type: 'Data' | 'Expression' | 'Statement' | 'Block',
        argMap: { [key: string]: TDataName[] },
    ) {
        super(name, label, kind, type, argMap);
    }
}

describe('class ElementSyntax', () => {
    describe('instantiation', () => {
        test('instantiate class that extends ElementSyntax with 0 arguments and validate API', () => {
            let dummyElementSyntax: DummyElementSyntax;

            dummyElementSyntax = new DummyElementSyntax('dummy', 'dummy', 'Argument', 'Data', {});
            expect(dummyElementSyntax.name).toBe('dummy');
            expect(dummyElementSyntax.label).toBe('dummy');
            expect(dummyElementSyntax.kind).toBe('Argument');
            expect(dummyElementSyntax.type).toBe('Data');
            expect(dummyElementSyntax.argCount).toBe(0);
            expect(dummyElementSyntax.argLabels).toEqual([]);

            dummyElementSyntax = new DummyElementSyntax(
                'dummy',
                'dummy',
                'Argument',
                'Expression',
                {},
            );
            expect(dummyElementSyntax.name).toBe('dummy');
            expect(dummyElementSyntax.label).toBe('dummy');
            expect(dummyElementSyntax.kind).toBe('Argument');
            expect(dummyElementSyntax.type).toBe('Expression');
            expect(dummyElementSyntax.argCount).toBe(0);
            expect(dummyElementSyntax.argLabels).toEqual([]);

            dummyElementSyntax = new DummyElementSyntax(
                'dummy',
                'dummy',
                'Instruction',
                'Statement',
                {},
            );
            expect(dummyElementSyntax.name).toBe('dummy');
            expect(dummyElementSyntax.label).toBe('dummy');
            expect(dummyElementSyntax.kind).toBe('Instruction');
            expect(dummyElementSyntax.type).toBe('Statement');
            expect(dummyElementSyntax.argCount).toBe(0);
            expect(dummyElementSyntax.argLabels).toEqual([]);

            dummyElementSyntax = new DummyElementSyntax(
                'dummy',
                'dummy',
                'Instruction',
                'Block',
                {},
            );
            expect(dummyElementSyntax.name).toBe('dummy');
            expect(dummyElementSyntax.label).toBe('dummy');
            expect(dummyElementSyntax.kind).toBe('Instruction');
            expect(dummyElementSyntax.type).toBe('Block');
            expect(dummyElementSyntax.argCount).toBe(0);
            expect(dummyElementSyntax.argLabels).toEqual([]);
        });

        test('instantiate class that extends ElementSyntax with 3 arguments and validate API', () => {
            const dummyElementSyntax = new DummyElementSyntax(
                'dummy',
                'dummy',
                'Instruction',
                'Block',
                {
                    arg1: ['number'],
                    arg2: ['string', 'number'],
                    arg3: ['boolean'],
                },
            );
            expect(dummyElementSyntax.name).toBe('dummy');
            expect(dummyElementSyntax.label).toBe('dummy');
            expect(dummyElementSyntax.kind).toBe('Instruction');
            expect(dummyElementSyntax.type).toBe('Block');
            expect(dummyElementSyntax.argCount).toBe(3);
            expect(dummyElementSyntax.argLabels).toEqual(['arg1', 'arg2', 'arg3']);
            expect(dummyElementSyntax.getArgType('arg1')).toEqual(['number']);
            expect(dummyElementSyntax.getArgType('arg2')).toEqual(['string', 'number']);
            expect(dummyElementSyntax.getArgType('arg3')).toEqual(['boolean']);
        });
    });

    test('update label and verify', () => {
        const dummyElementSyntax = new DummyElementSyntax('dummy', 'dummy', 'Argument', 'Data', {});
        expect(dummyElementSyntax.label).toBe('dummy');
        dummyElementSyntax.updateLabel('dummyElement');
        expect(dummyElementSyntax.label).toBe('dummyElement');
    });
});
