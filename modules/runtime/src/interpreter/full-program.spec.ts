import { describe, it, expect } from 'vitest';
import { IRInterpreter } from './interpreter';
import { createMockIRProgram } from './testing/mock-program';
import { IRProgram } from './ir-program';
import { IRFunction } from './ir-function';
import { IRBasicBlock } from './ir-basic-block';
import { SymDeclareInstruction } from './instructions/sym-declare-instruction';
import { SymAssignInstruction } from './instructions/sym-assign-instruction';
import { SymQueryInstruction } from './instructions/sym-query-instruction';
import { CompareJumpInstruction } from './instructions/compare-jump-instruction';
import { JumpInstruction } from './instructions/jump-instruction';
import { CallInstruction } from './instructions/call-instruction';

describe('Full Mock Program Integration Test', () => {
    it('should execute a simplified version of the mock program with loops and conditionals', () => {
        const functions = new Map();

        // Simplified start2 function with a simple loop
        const start2Function = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new CallInstruction('Clear', []),
                new SymDeclareInstruction('box1'),
                new SymAssignInstruction('box1', 0),
                new SymDeclareInstruction('i'),
                new SymAssignInstruction('i', 0),

                // Declare variables used for SymQueryInstruction before the loop
                new SymDeclareInstruction('current_i'),
                new SymDeclareInstruction('current_box1'),

                new JumpInstruction('loop_condition'),
            ]),

            new IRBasicBlock('loop_condition', [
                new CompareJumpInstruction('lessThan', 'i', 2, 'loop_body', 'loop_end'),
            ]),

            new IRBasicBlock('loop_body', [
                new CallInstruction('action1', []),
                new CallInstruction('action2', []),

                // Use SymQueryInstruction to read current loop counter value
                new SymQueryInstruction('i', 'current_i'),

                // Use SymQueryInstruction to read current box1 value for calculations
                new SymQueryInstruction('box1', 'current_box1'),

                // Increment box1: box1 = box1 + 1
                new SymAssignInstruction('box1', { op: 'add', left: 'box1', right: 1 }),

                // Increment i: i = i + 1
                new SymAssignInstruction('i', { op: 'add', left: 'i', right: 1 }),
                new JumpInstruction('loop_condition'),
            ]),

            new IRBasicBlock('loop_end', [
                // End of program - implicit halt
            ]),
        ]);

        // Simple action1
        const action1Function = new IRFunction('action1', [
            new IRBasicBlock('entry', [new CallInstruction('PlayNote', ['D4', 0.25])]),
        ]);

        // action2 with conditional - demonstrates SymQueryInstruction usage without cross-scope variable access
        const action2Function = new IRFunction('action2', [
            new IRBasicBlock('entry', [
                new CallInstruction('Forward', [50]),

                // Declare local variables to demonstrate SymQueryInstruction
                new SymDeclareInstruction('local_counter'),
                new SymAssignInstruction('local_counter', 1),
                new SymDeclareInstruction('local_flag'),
                new SymAssignInstruction('local_flag', true),

                // Use SymQueryInstruction to read local variables before decision making
                new SymDeclareInstruction('counter_value'),
                new SymQueryInstruction('local_counter', 'counter_value'),

                new CompareJumpInstruction(
                    'greaterThan',
                    'local_counter',
                    0,
                    'if_true',
                    'if_false',
                ),
            ]),

            new IRBasicBlock('if_true', [
                // Query the flag value for logging/decision purposes
                new SymDeclareInstruction('flag_status'),
                new SymQueryInstruction('local_flag', 'flag_status'),

                new CallInstruction('Right', [90]),
                new JumpInstruction('end_if'),
            ]),

            new IRBasicBlock('if_false', [
                // Query counter value again in the false branch
                new SymDeclareInstruction('counter_in_false'),
                new SymQueryInstruction('local_counter', 'counter_in_false'),

                new CallInstruction('Left', [90]),
                new JumpInstruction('end_if'),
            ]),

            new IRBasicBlock('end_if', [
                // Increment local counter to demonstrate variable modification
                new SymAssignInstruction('local_counter', {
                    op: 'add',
                    left: 'local_counter',
                    right: 1,
                }),
            ]),
        ]);

        functions.set('start2', start2Function);
        functions.set('action1', action1Function);
        functions.set('action2', action2Function);
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter();
        interpreter.load(program);
        interpreter.run();

        const context = interpreter.getContext()!;
        expect(context.isHalted).toBe(true);
        expect(context.callStack.length).toBe(0);

        // Verify that variables have expected final values
        expect(context.valueStore.getValue('i')).toBe(2);
        expect(context.valueStore.getValue('box1')).toBe(2);
    });

    it('should load and validate the full mock program structure without running', () => {
        const program = createMockIRProgram();
        const interpreter = new IRInterpreter();

        interpreter.load(program);

        const context = interpreter.getContext()!;
        expect(context.program).toBe(program);
        expect(context.instructionPointer.functionName).toBe('start2');
        expect(context.instructionPointer.blockLabel).toBe('entry');
        expect(context.instructionPointer.instructionIndex).toBe(0);

        // Verify all expected functions are present
        expect(program.functions.has('start2')).toBe(true);
        expect(program.functions.has('action1')).toBe(true);
        expect(program.functions.has('action2')).toBe(true);

        // Verify start2 has correct block structure
        const start2 = program.functions.get('start2')!;
        expect(start2.blocks.length).toBe(4);
        expect(start2.blocks.map((b: IRBasicBlock) => b.label)).toEqual([
            'entry',
            'loop_condition',
            'loop_body',
            'loop_end',
        ]);

        // Verify action2 has conditional blocks
        const action2 = program.functions.get('action2')!;
        expect(action2.blocks.length).toBe(4);
        expect(action2.blocks.map((b: IRBasicBlock) => b.label)).toEqual([
            'entry',
            'if_true',
            'if_false',
            'end_if',
        ]);
    });
});
