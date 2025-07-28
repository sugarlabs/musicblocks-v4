import { IRProgram } from '../ir-program';
import { IRFunction } from '../ir-function';
import { IRBasicBlock } from '../ir-basic-block';
import { SymDeclareInstruction } from '../instructions/sym-declare-instruction';
import { SymAssignInstruction } from '../instructions/sym-assign-instruction';
import { SymQueryInstruction } from '../instructions/sym-query-instruction';
import { JumpInstruction } from '../instructions/jump-instruction';
import { CompareJumpInstruction } from '../instructions/compare-jump-instruction';
import { CallInstruction } from '../instructions/call-instruction';

/**
 * Creates a mock IR program that represents a manual translation of the AST
 * found in modules/program/src/examples/MusicBlocksProgram.ts
 *
 * The program includes:
 * - start2 function: Main entry point with a loop and function calls
 * - action1 function: Plays two notes
 * - action2 function: Forward movement with conditional branching
 */
export function createMockIRProgram(): IRProgram {
    const functions = new Map<string, IRFunction>();

    // Create start2 function (main entry point)
    const start2Function = new IRFunction('start2', [
        new IRBasicBlock('entry', [
            new CallInstruction('Clear', []),

            // Declare and initialize variables (box1 = 0, box2 = 10)
            new SymDeclareInstruction('box1'),
            new SymAssignInstruction('box1', 0),
            new SymDeclareInstruction('box2'),
            new SymAssignInstruction('box2', 10),

            // Set key and master volume
            new CallInstruction('SetKey', ['C major']),
            new CallInstruction('SetMasterVolume', [80]),

            // Play note
            new CallInstruction('PlayNote', ['C4', 0.25]),

            // Initialize loop counter
            new SymDeclareInstruction('i'),
            new SymAssignInstruction('i', 0),

            // Jump to loop condition check
            new JumpInstruction('loop_condition'),
        ]),

        new IRBasicBlock('loop_condition', [
            new CompareJumpInstruction('lessThan', 'i', 3, 'loop_body', 'loop_end'),
        ]),

        new IRBasicBlock('loop_body', [
            // Use SymQueryInstruction to read current loop counter before function calls
            new SymDeclareInstruction('loop_counter_value'),
            new SymQueryInstruction('i', 'loop_counter_value'),

            // Use SymQueryInstruction to read box values for monitoring
            new SymDeclareInstruction('current_box1'),
            new SymQueryInstruction('box1', 'current_box1'),
            new SymDeclareInstruction('current_box2'),
            new SymQueryInstruction('box2', 'current_box2'),

            // Call action1
            new CallInstruction('action1', []),

            // Call action2
            new CallInstruction('action2', []),

            // Increment box1 (box1 = box1 + 1)
            new SymDeclareInstruction('_temp_add'),
            new SymAssignInstruction('_temp_add', 'box1'),
            // Note: This is simplified - in real IR we'd have arithmetic instructions
            // For now, we'll simulate the addition in the assignment
            new SymAssignInstruction('box1', '_temp_add_plus_1'), // This represents box1 + 1

            // Increment loop counter (i = i + 1)
            new SymAssignInstruction('i', '_i_plus_1'), // This represents i + 1

            // Jump back to condition
            new JumpInstruction('loop_condition'),
        ]),

        new IRBasicBlock('loop_end', [
            // End of program - implicit return
        ]),
    ]);

    // Create action1 function
    const action1Function = new IRFunction('action1', [
        new IRBasicBlock('entry', [
            new CallInstruction('PlayNote', ['D4', 0.25]),
            new CallInstruction('PlayNote', ['E4', 0.25]),
        ]),
    ]);

    // Create action2 function
    const action2Function = new IRFunction('action2', [
        new IRBasicBlock('entry', [
            new CallInstruction('Forward', [50]),

            // Declare local variables to demonstrate SymQueryInstruction within function scope
            new SymDeclareInstruction('local_box'),
            new SymAssignInstruction('local_box', 6),
            new SymDeclareInstruction('local_counter'),
            new SymAssignInstruction('local_counter', 1),

            // Use SymQueryInstruction to read local_box value before decision making
            new SymDeclareInstruction('box_before_check'),
            new SymQueryInstruction('local_box', 'box_before_check'),

            // Check if local_box > 5
            new CompareJumpInstruction('greaterThan', 'local_box', 5, 'if_true', 'if_false'),
        ]),

        new IRBasicBlock('if_true', [
            // Query counter in true branch for context
            new SymDeclareInstruction('counter_in_true'),
            new SymQueryInstruction('local_counter', 'counter_in_true'),

            new CallInstruction('Right', [90]),
            new JumpInstruction('end_if'),
        ]),

        new IRBasicBlock('if_false', [
            new SymDeclareInstruction('box_in_false'),
            new SymQueryInstruction('local_box', 'box_in_false'),

            new CallInstruction('Left', [90]),
        ]),

        new IRBasicBlock('end_if', [
            // End of function - implicit return
        ]),
    ]);

    // Add functions to the program
    functions.set('start2', start2Function);
    functions.set('action1', action1Function);
    functions.set('action2', action2Function);

    return new IRProgram(functions);
}

/**
 * Simple value storage for testing the interpreter.
 * In a real implementation, this would interface with the Memory Subsystem.
 */
export class SimpleValueStore {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private values: Map<string, any> = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getValue(name: string): any {
        return this.values.get(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(name: string, value: any): void {
        this.values.set(name, value);
    }

    hasValue(name: string): boolean {
        return this.values.has(name);
    }

    clear(): void {
        this.values.clear();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAllValues(): Map<string, any> {
        return new Map(this.values);
    }
}
