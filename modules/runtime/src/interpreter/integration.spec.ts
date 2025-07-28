import { describe, it, expect, vi } from 'vitest';
import { IRInterpreter } from './interpreter';
import { createMockIRProgram } from './testing/mock-program';
import { IRProgram } from './ir-program';
import { IRFunction } from './ir-function';
import { IRBasicBlock } from './ir-basic-block';
import { CallInstruction } from './instructions/call-instruction';
import { SymDeclareInstruction } from './instructions/sym-declare-instruction';
import { SymAssignInstruction } from './instructions/sym-assign-instruction';

describe('IRInterpreter Integration Tests', () => {
    it('should execute a simple program with host calls', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // Create a simple program
        const functions = new Map();
        const startFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new CallInstruction('Clear', []),
                new CallInstruction('PlayNote', ['C4', 0.25]),
                new CallInstruction('Forward', [50]),
            ]),
        ]);
        functions.set('start2', startFunction);
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter();
        interpreter.load(program);
        interpreter.run();

        const context = interpreter.getContext()!;
        expect(context.isHalted).toBe(true);

        expect(consoleSpy).toHaveBeenCalledWith('Call: Clear with args: []');
        expect(consoleSpy).toHaveBeenCalledWith('Call: PlayNote with args: ["C4",0.25]');
        expect(consoleSpy).toHaveBeenCalledWith('Call: Forward with args: [50]');

        consoleSpy.mockRestore();
    });

    it('should handle variable declaration and assignment', () => {
        const functions = new Map();
        const startFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new SymDeclareInstruction('box1'),
                new SymAssignInstruction('box1', 42),
                new SymDeclareInstruction('box2'),
                new SymAssignInstruction('box2', 'box1'),
            ]),
        ]);
        functions.set('start2', startFunction);
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter();
        interpreter.load(program);
        interpreter.run();

        const context = interpreter.getContext()!;
        expect(context.isHalted).toBe(true);
        expect(context.valueStore.getValue('box1')).toBe(42);
        expect(context.valueStore.getValue('box2')).toBe(42);
    });

    it('should step through instructions one by one', () => {
        const functions = new Map();
        const startFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new SymDeclareInstruction('counter'),
                new SymAssignInstruction('counter', 0),
                new SymAssignInstruction('counter', 1),
            ]),
        ]);
        functions.set('start2', startFunction);
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter();
        interpreter.load(program);

        const context = interpreter.getContext()!;

        // Step 1: Declare counter
        expect(context.isHalted).toBe(false);
        interpreter.step();
        expect(context.instructionPointer.instructionIndex).toBe(1);

        // Step 2: Assign 0 to counter
        interpreter.step();
        expect(context.valueStore.getValue('counter')).toBe(0);
        expect(context.instructionPointer.instructionIndex).toBe(2);

        // Step 3: Assign 1 to counter
        interpreter.step();
        expect(context.valueStore.getValue('counter')).toBe(1);
        expect(context.instructionPointer.instructionIndex).toBe(3);

        // Step 4: End of program
        interpreter.step();
        expect(context.isHalted).toBe(true);
    });

    it('should load and validate mock program structure', () => {
        const program = createMockIRProgram();
        const interpreter = new IRInterpreter();

        interpreter.load(program);

        const context = interpreter.getContext()!;
        expect(context.program).toBe(program);
        expect(context.instructionPointer.functionName).toBe('start2');
        expect(context.instructionPointer.blockLabel).toBe('entry');
        expect(context.instructionPointer.instructionIndex).toBe(0);
        expect(context.callStack.length).toBe(0);
        expect(context.isHalted).toBe(false);
    });
});
