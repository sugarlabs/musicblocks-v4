import { describe, it, expect } from 'vitest';
import { ExecutionContext } from './execution-context';
import { IRProgram } from './ir-program';
import { IRFunction } from './ir-function';

describe('ExecutionContext', () => {
    it('should be instantiated correctly', () => {
        const functions = new Map<string, IRFunction>();
        const program = new IRProgram(functions);
        const context = new ExecutionContext(program);

        expect(context).toBeInstanceOf(ExecutionContext);
        expect(context.program).toBe(program);
        expect(context.callStack).toEqual([]);
        expect(context.isHalted).toBe(false);
        expect(context.instructionPointer).toEqual({
            functionName: '',
            blockLabel: '',
            instructionIndex: 0,
        });
    });

    it('should initialize with empty call stack', () => {
        const functions = new Map<string, IRFunction>();
        const program = new IRProgram(functions);
        const context = new ExecutionContext(program);

        expect(context.callStack.length).toBe(0);
    });

    it('should allow modification of execution state', () => {
        const functions = new Map<string, IRFunction>();
        const program = new IRProgram(functions);
        const context = new ExecutionContext(program);

        context.isHalted = true;
        expect(context.isHalted).toBe(true);

        context.instructionPointer.functionName = 'start2';
        context.instructionPointer.blockLabel = 'entry';
        context.instructionPointer.instructionIndex = 5;

        expect(context.instructionPointer.functionName).toBe('start2');
        expect(context.instructionPointer.blockLabel).toBe('entry');
        expect(context.instructionPointer.instructionIndex).toBe(5);
    });
});
