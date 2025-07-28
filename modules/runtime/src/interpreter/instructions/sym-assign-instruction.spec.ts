import { describe, it, expect } from 'vitest';
import { SymAssignInstruction } from './sym-assign-instruction';
import { ExecutionContext } from '../execution-context';
import { IRProgram } from '../ir-program';

describe('SymAssignInstruction', () => {
    it('should be instantiated correctly', () => {
        const instruction = new SymAssignInstruction('testVariable', 42);

        expect(instruction).toBeInstanceOf(SymAssignInstruction);
        expect(instruction.destinationVariable).toBe('testVariable');
        expect(instruction.source).toBe(42);
        expect(instruction.metadata).toEqual({});
    });

    it('should assign literal values to variables', () => {
        const instruction = new SymAssignInstruction('myVar', 123);
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        instruction.execute(context);

        expect(context.valueStore.getValue('myVar')).toBe(123);
        expect(context.valueStore.hasValue('myVar')).toBe(true);
    });

    it('should assign variable references', () => {
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        context.valueStore.setValue('sourceVar', 'hello');

        const instruction = new SymAssignInstruction('destVar', 'sourceVar');
        instruction.execute(context);

        expect(context.valueStore.getValue('destVar')).toBe('hello');
    });

    it('should handle special arithmetic expressions', () => {
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        // Test _temp_add_plus_1
        context.valueStore.setValue('_temp_add', 5);
        const instruction1 = new SymAssignInstruction('result1', '_temp_add_plus_1');
        instruction1.execute(context);
        expect(context.valueStore.getValue('result1')).toBe(6);

        // Test _i_plus_1
        context.valueStore.setValue('i', 10);
        const instruction2 = new SymAssignInstruction('result2', '_i_plus_1');
        instruction2.execute(context);
        expect(context.valueStore.getValue('result2')).toBe(11);

        // Test _temp_add (should just return its own value)
        context.valueStore.setValue('_temp_add', 42);
        const instruction3 = new SymAssignInstruction('result3', '_temp_add');
        instruction3.execute(context);
        expect(context.valueStore.getValue('result3')).toBe(42);
    });
});
