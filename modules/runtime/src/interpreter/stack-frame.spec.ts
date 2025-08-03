import { describe, it, expect } from 'vitest';
import { StackFrame } from './stack-frame';
import { SymbolTable } from '../execution/scope/symbol-table';

describe('StackFrame', () => {
    it('should be instantiated correctly', () => {
        const symbolTable = new SymbolTable();
        const returnAddress = {
            functionName: 'callerFunction',
            blockLabel: 'entry',
            instructionIndex: 5,
        };
        const frame = new StackFrame('testFunction', symbolTable, returnAddress);

        expect(frame).toBeInstanceOf(StackFrame);
        expect(frame.functionName).toBe('testFunction');
        expect(frame.localScope).toBe(symbolTable);
        expect(frame.returnAddress).toBe(returnAddress);
        expect(frame.returnValue).toBe(null);
    });

    it('should allow setting return value', () => {
        const symbolTable = new SymbolTable();
        const returnAddress = {
            functionName: 'callerFunction',
            blockLabel: 'entry',
            instructionIndex: 5,
        };
        const frame = new StackFrame('testFunction', symbolTable, returnAddress);

        frame.returnValue = 42;
        expect(frame.returnValue).toBe(42);

        frame.returnValue = 'test string';
        expect(frame.returnValue).toBe('test string');
    });
});
