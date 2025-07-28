import { describe, it, expect } from 'vitest';
import { JumpInstruction } from './jump-instruction';
import { ExecutionContext } from '../execution-context';
import { IRProgram } from '../ir-program';

describe('JumpInstruction', () => {
    it('should be instantiated correctly', () => {
        const instruction = new JumpInstruction('targetBlock');

        expect(instruction).toBeInstanceOf(JumpInstruction);
        expect(instruction.targetLabel).toBe('targetBlock');
        expect(instruction.metadata).toEqual({});
    });

    it('should change instruction pointer to target block', () => {
        const instruction = new JumpInstruction('loop_body');
        const program = new IRProgram(new Map());
        const context = new ExecutionContext(program);

        context.instructionPointer.blockLabel = 'entry';
        context.instructionPointer.instructionIndex = 5;

        instruction.execute(context);

        expect(context.instructionPointer.blockLabel).toBe('loop_body');
        expect(context.instructionPointer.instructionIndex).toBe(0);
    });
});
