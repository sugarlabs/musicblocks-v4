import { describe, it, expect } from 'vitest';
import { CompareJumpInstruction } from './compare-jump-instruction';
import { ExecutionContext } from '../execution-context';
import { IRProgram } from '../ir-program';

describe('CompareJumpInstruction', () => {
    it('should be instantiated correctly', () => {
        const instruction = new CompareJumpInstruction(
            'greaterThan',
            'box1',
            5,
            'true_block',
            'false_block',
        );

        expect(instruction).toBeInstanceOf(CompareJumpInstruction);
        expect(instruction.condition).toBe('greaterThan');
        expect(instruction.operand1).toBe('box1');
        expect(instruction.operand2).toBe(5);
        expect(instruction.trueTargetLabel).toBe('true_block');
        expect(instruction.falseTargetLabel).toBe('false_block');
        expect(instruction.metadata).toEqual({});
    });

    it('should jump to true target when condition is true', () => {
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        context.valueStore.setValue('box1', 10);

        const instruction = new CompareJumpInstruction(
            'greaterThan',
            'box1',
            5,
            'if_true',
            'if_false',
        );

        instruction.execute(context);

        expect(context.instructionPointer.blockLabel).toBe('if_true');
        expect(context.instructionPointer.instructionIndex).toBe(0);
    });

    it('should jump to false target when condition is false', () => {
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        context.valueStore.setValue('box1', 3);

        const instruction = new CompareJumpInstruction(
            'greaterThan',
            'box1',
            5,
            'if_true',
            'if_false',
        );

        instruction.execute(context);

        expect(context.instructionPointer.blockLabel).toBe('if_false');
        expect(context.instructionPointer.instructionIndex).toBe(0);
    });

    it('should handle different comparison operators', () => {
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        // Test lessThan
        const instruction1 = new CompareJumpInstruction(
            'lessThan',
            3,
            5,
            'true_block',
            'false_block',
        );
        instruction1.execute(context);
        expect(context.instructionPointer.blockLabel).toBe('true_block');

        // Test equal
        const instruction2 = new CompareJumpInstruction(
            'equal',
            5,
            5,
            'equal_block',
            'not_equal_block',
        );
        instruction2.execute(context);
        expect(context.instructionPointer.blockLabel).toBe('equal_block');

        // Test notEqual
        const instruction3 = new CompareJumpInstruction(
            'notEqual',
            3,
            5,
            'not_equal_block',
            'equal_block',
        );
        instruction3.execute(context);
        expect(context.instructionPointer.blockLabel).toBe('not_equal_block');
    });

    it('should throw error for unknown condition', () => {
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        const instruction = new CompareJumpInstruction(
            'unknownCondition',
            5,
            3,
            'true_block',
            'false_block',
        );

        expect(() => instruction.execute(context)).toThrow('Unknown condition: unknownCondition');
    });
});
