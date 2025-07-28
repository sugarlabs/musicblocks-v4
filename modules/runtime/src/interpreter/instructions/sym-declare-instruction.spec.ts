import { describe, it, expect } from 'vitest';
import { SymDeclareInstruction } from './sym-declare-instruction';
import { ExecutionContext } from '../execution-context';
import { IRProgram } from '../ir-program';

describe('SymDeclareInstruction', () => {
    it('should be instantiated correctly', () => {
        const instruction = new SymDeclareInstruction('testVariable');

        expect(instruction).toBeInstanceOf(SymDeclareInstruction);
        expect(instruction.variableName).toBe('testVariable');
        expect(instruction.metadata).toEqual({});
    });

    it('should execute and declare a variable in symbol table', () => {
        const instruction = new SymDeclareInstruction('testVariable');
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        instruction.execute(context);

        const symbolTable = context.getCurrentSymbolTable();
        const lookup = symbolTable.lookup('testVariable');
        expect(lookup).not.toBe(null);
        expect(lookup!.entry.name).toBe('testVariable');
    });
});
