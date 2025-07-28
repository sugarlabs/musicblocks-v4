import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';

/**
 * JumpInstruction: Unconditionally jumps to a new block within the same function.
 */
export class JumpInstruction extends IRInstruction {
    constructor(public targetLabel: string) {
        super();
    }

    execute(context: ExecutionContext): void {
        context.instructionPointer.blockLabel = this.targetLabel;
        context.instructionPointer.instructionIndex = 0;
    }
}
