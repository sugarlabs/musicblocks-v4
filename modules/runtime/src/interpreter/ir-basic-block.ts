import { IRInstruction } from './instructions/ir-instruction';

/**
 * IRBasicBlock represents a linear sequence of instructions that ends with
 * a control-flow instruction (jump, compare_jump, or implicit fall-through).
 */
export class IRBasicBlock {
    constructor(
        public label: string,
        public instructions: IRInstruction[],
    ) {}
}
