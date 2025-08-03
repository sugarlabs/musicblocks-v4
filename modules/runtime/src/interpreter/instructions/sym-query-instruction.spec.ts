import { describe, it, expect } from 'vitest';
import { SymQueryInstruction } from './sym-query-instruction';
import { ExecutionContext } from '../execution-context';
import { IRProgram } from '../ir-program';
import { SymbolType, DataType } from '../../@types/symbol-types';

describe('SymQueryInstruction', () => {
    it('should be instantiated correctly', () => {
        const instruction = new SymQueryInstruction('myVariable');

        expect(instruction).toBeInstanceOf(SymQueryInstruction);
        expect(instruction.variableName).toBe('myVariable');
        expect(instruction.targetVariable).toBeUndefined();
    });

    it('should be instantiated with target variable', () => {
        const instruction = new SymQueryInstruction('sourceVar', 'targetVar');

        expect(instruction).toBeInstanceOf(SymQueryInstruction);
        expect(instruction.variableName).toBe('sourceVar');
        expect(instruction.targetVariable).toBe('targetVar');
    });

    it('should retrieve value from symbol table and value store', () => {
        const instruction = new SymQueryInstruction('testVar');
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        // First declare the variable in the symbol table
        const symbolTable = context.getCurrentSymbolTable();
        symbolTable.declare('testVar', SymbolType.USER_VARIABLE, DataType.ANY, {
            isMutable: true,
        });

        // Set a value in the value store
        context.valueStore.setValue('testVar', 42);

        // Set initial instruction pointer
        context.instructionPointer.instructionIndex = 0;

        instruction.execute(context);

        // Check that instruction pointer was advanced
        expect(context.instructionPointer.instructionIndex).toBe(1);
    });

    it('should store value in target variable when specified', () => {
        const instruction = new SymQueryInstruction('sourceVar', 'targetVar');
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        // Declare the source variable in the symbol table
        const symbolTable = context.getCurrentSymbolTable();
        symbolTable.declare('sourceVar', SymbolType.USER_VARIABLE, DataType.ANY, {
            isMutable: true,
        });

        // Set a value in the value store
        context.valueStore.setValue('sourceVar', 'hello world');

        // Set initial instruction pointer
        context.instructionPointer.instructionIndex = 0;

        instruction.execute(context);

        // Check that the value was copied to the target variable
        expect(context.valueStore.getValue('targetVar')).toBe('hello world');
        expect(context.instructionPointer.instructionIndex).toBe(1);
    });

    it('should throw error when variable not found in symbol table', () => {
        const instruction = new SymQueryInstruction('nonexistentVar');
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        expect(() => instruction.execute(context)).toThrow(
            "Variable 'nonexistentVar' not found in symbol table",
        );
    });
});
