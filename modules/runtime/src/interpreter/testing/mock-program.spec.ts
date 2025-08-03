import { describe, it, expect } from 'vitest';
import { createMockIRProgram, SimpleValueStore } from './mock-program';
import { IRProgram } from '../ir-program';

describe('Mock IR Program', () => {
    it('should create a valid IR program with expected functions', () => {
        const program = createMockIRProgram();

        expect(program).toBeInstanceOf(IRProgram);
        expect(program.functions.size).toBe(3);
        expect(program.functions.has('start2')).toBe(true);
        expect(program.functions.has('action1')).toBe(true);
        expect(program.functions.has('action2')).toBe(true);
    });

    it('should have start2 function with correct structure', () => {
        const program = createMockIRProgram();
        const start2 = program.functions.get('start2')!;

        expect(start2.name).toBe('start2');
        expect(start2.blocks.length).toBe(4); // entry, loop_condition, loop_body, loop_end
        expect(start2.blocks[0].label).toBe('entry');
        expect(start2.blocks[1].label).toBe('loop_condition');
        expect(start2.blocks[2].label).toBe('loop_body');
        expect(start2.blocks[3].label).toBe('loop_end');
    });

    it('should have action1 function with PlayNote instructions', () => {
        const program = createMockIRProgram();
        const action1 = program.functions.get('action1')!;

        expect(action1.name).toBe('action1');
        expect(action1.blocks.length).toBe(1);
        expect(action1.blocks[0].label).toBe('entry');
        expect(action1.blocks[0].instructions.length).toBe(2);
    });

    it('should have action2 function with conditional branching', () => {
        const program = createMockIRProgram();
        const action2 = program.functions.get('action2')!;

        expect(action2.name).toBe('action2');
        expect(action2.blocks.length).toBe(4); // entry, if_true, if_false, end_if
        expect(action2.blocks[0].label).toBe('entry');
        expect(action2.blocks[1].label).toBe('if_true');
        expect(action2.blocks[2].label).toBe('if_false');
        expect(action2.blocks[3].label).toBe('end_if');
    });
});

describe('SimpleValueStore', () => {
    it('should store and retrieve values correctly', () => {
        const store = new SimpleValueStore();

        store.setValue('box1', 42);
        expect(store.getValue('box1')).toBe(42);
        expect(store.hasValue('box1')).toBe(true);
        expect(store.hasValue('box2')).toBe(false);
    });

    it('should handle different data types', () => {
        const store = new SimpleValueStore();

        store.setValue('number', 123);
        store.setValue('string', 'hello');
        store.setValue('boolean', true);
        store.setValue('object', { key: 'value' });

        expect(store.getValue('number')).toBe(123);
        expect(store.getValue('string')).toBe('hello');
        expect(store.getValue('boolean')).toBe(true);
        expect(store.getValue('object')).toEqual({ key: 'value' });
    });

    it('should clear all values', () => {
        const store = new SimpleValueStore();

        store.setValue('a', 1);
        store.setValue('b', 2);
        expect(store.getAllValues().size).toBe(2);

        store.clear();
        expect(store.getAllValues().size).toBe(0);
        expect(store.hasValue('a')).toBe(false);
        expect(store.hasValue('b')).toBe(false);
    });
});
