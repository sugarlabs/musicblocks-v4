import { describe, it, expect, vi } from 'vitest';
import { IRInterpreter } from './interpreter';
import { IRProgram } from './ir-program';
import { IRFunction } from './ir-function';
import { IRBasicBlock } from './ir-basic-block';
import { CallInstruction } from './instructions/call-instruction';

describe('Function Call Integration Tests', () => {
    it('should execute function calls and returns correctly', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // Create a program with function calls
        const functions = new Map();

        // Main function that calls action1
        const mainFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new CallInstruction('Clear', []),
                new CallInstruction('action1', []),
                new CallInstruction('Finish', []),
            ]),
        ]);

        // Called function
        const action1Function = new IRFunction('action1', [
            new IRBasicBlock('entry', [
                new CallInstruction('PlayNote', ['D4', 0.25]),
                new CallInstruction('PlayNote', ['E4', 0.25]),
                // Implicit return here
            ]),
        ]);

        functions.set('start2', mainFunction);
        functions.set('action1', action1Function);
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter();
        interpreter.load(program);

        // Step through the program
        const context = interpreter.getContext()!;

        // Step 1: Clear
        expect(context.instructionPointer.functionName).toBe('start2');
        expect(context.instructionPointer.blockLabel).toBe('entry');
        expect(context.instructionPointer.instructionIndex).toBe(0);
        interpreter.step();

        // Step 2: Call action1
        expect(context.instructionPointer.instructionIndex).toBe(1);
        interpreter.step();

        // Should now be in action1
        expect(context.instructionPointer.functionName).toBe('action1');
        expect(context.instructionPointer.blockLabel).toBe('entry');
        expect(context.instructionPointer.instructionIndex).toBe(0);
        expect(context.callStack.length).toBe(1);

        // Step 3: First PlayNote in action1
        interpreter.step();
        expect(context.instructionPointer.instructionIndex).toBe(1);

        // Step 4: Second PlayNote in action1
        interpreter.step();
        expect(context.instructionPointer.instructionIndex).toBe(2);

        // Step 5: End of action1 (implicit return)
        interpreter.step();

        // Should be back in start2 after the call
        expect(context.instructionPointer.functionName).toBe('start2');
        expect(context.instructionPointer.blockLabel).toBe('entry');
        expect(context.instructionPointer.instructionIndex).toBe(2);
        expect(context.callStack.length).toBe(0);

        // Step 6: Finish
        interpreter.step();

        // Step 7: End of program
        interpreter.step();
        expect(context.isHalted).toBe(true);

        // Verify all host calls were made in correct order
        expect(consoleSpy).toHaveBeenCalledWith('Call: Clear with args: []');
        expect(consoleSpy).toHaveBeenCalledWith('Call: PlayNote with args: ["D4",0.25]');
        expect(consoleSpy).toHaveBeenCalledWith('Call: PlayNote with args: ["E4",0.25]');
        expect(consoleSpy).toHaveBeenCalledWith('Call: Finish with args: []');

        consoleSpy.mockRestore();
    });

    it('should handle nested function calls', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const functions = new Map();

        // Main function
        const mainFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new CallInstruction('Start', []),
                new CallInstruction('level1', []), // Function call
                new CallInstruction('End', []),
            ]),
        ]);

        // Level 1 function calls level 2
        const level1Function = new IRFunction('level1', [
            new IRBasicBlock('entry', [
                new CallInstruction('Level1', []),
                new CallInstruction('level2', []), // Function call
                new CallInstruction('Level1End', []),
            ]),
        ]);

        // Level 2 function
        const level2Function = new IRFunction('level2', [
            new IRBasicBlock('entry', [new CallInstruction('Level2', [])]),
        ]);

        functions.set('start2', mainFunction);
        functions.set('level1', level1Function);
        functions.set('level2', level2Function);
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter();
        interpreter.load(program);
        interpreter.run();

        const context = interpreter.getContext()!;
        expect(context.isHalted).toBe(true);
        expect(context.callStack.length).toBe(0);

        // Verify execution order
        expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Call: Start with args: []');
        expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Call: Level1 with args: []');
        expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Call: Level2 with args: []');
        expect(consoleSpy).toHaveBeenNthCalledWith(4, 'Call: Level1End with args: []');
        expect(consoleSpy).toHaveBeenNthCalledWith(5, 'Call: End with args: []');

        consoleSpy.mockRestore();
    });
});
