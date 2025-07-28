import { describe, it, expect } from 'vitest';
import { IRBasicBlock } from './ir-basic-block';
import { IRInstruction } from './instructions/ir-instruction';
import { CallInstruction } from './instructions/call-instruction';

describe('IRBasicBlock', () => {
    it('should be instantiated correctly with label and instructions', () => {
        const instructions: IRInstruction[] = [];
        const block = new IRBasicBlock('testLabel', instructions);

        expect(block).toBeInstanceOf(IRBasicBlock);
        expect(block.label).toBe('testLabel');
        expect(block.instructions).toBe(instructions);
        expect(block.instructions.length).toBe(0);
    });

    it('should store instructions correctly', () => {
        const instruction1 = new CallInstruction('PlayNote', ['C4', 0.25]);
        const instruction2 = new CallInstruction('Forward', [50]);
        const instructions = [instruction1, instruction2];

        const block = new IRBasicBlock('testLabel', instructions);

        expect(block.instructions.length).toBe(2);
        expect(block.instructions[0]).toBe(instruction1);
        expect(block.instructions[1]).toBe(instruction2);
    });
});
