import { describe, it, expect } from 'vitest';
import { IRInterpreter } from './interpreter';
import { createMockIRProgram } from './testing/mock-program';

describe('IRInterpreter', () => {
    it('should be instantiated correctly', () => {
        const interpreter = new IRInterpreter();
        expect(interpreter).toBeInstanceOf(IRInterpreter);
        expect(interpreter.getContext()).toBe(null);
    });

    it('should load a program and initialize context', () => {
        const interpreter = new IRInterpreter();
        const program = createMockIRProgram();

        interpreter.load(program);

        const context = interpreter.getContext();
        expect(context).not.toBe(null);
        expect(context!.program).toBe(program);
        expect(context!.instructionPointer.functionName).toBe('start2');
        expect(context!.instructionPointer.blockLabel).toBe('entry');
        expect(context!.instructionPointer.instructionIndex).toBe(0);
        expect(context!.isHalted).toBe(false);
        expect(context!.callStack.length).toBe(0);
    });

    it('should throw error if no start2 function exists', () => {
        const interpreter = new IRInterpreter();
        const emptyProgram = createMockIRProgram();
        emptyProgram.functions.delete('start2');

        expect(() => interpreter.load(emptyProgram)).toThrow(
            'Program must have a start2 function with at least one block',
        );
    });

    it('should throw error when trying to run without loaded program', () => {
        const interpreter = new IRInterpreter();

        expect(() => interpreter.run()).toThrow('No program loaded. Call load() first.');

        expect(() => interpreter.step()).toThrow('No program loaded. Call load() first.');
    });

    it('should handle step when program is halted', () => {
        const interpreter = new IRInterpreter();
        const program = createMockIRProgram();

        interpreter.load(program);
        const context = interpreter.getContext()!;
        context.isHalted = true;

        interpreter.step();
        expect(context.isHalted).toBe(true);
    });
});
