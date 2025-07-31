import { IRProgram } from './ir-program';
import { ExecutionContext } from './execution-context';
import { IRInstruction } from './instructions/ir-instruction';

/**
 * IRInterpreter executes IR programs step by step.
 */
export class IRInterpreter {
    private context: ExecutionContext | null = null;

    constructor() {}

    /**
     * Load a program into the interpreter.
     */
    load(program: IRProgram): void {
        this.context = new ExecutionContext(program);

        let startFunction = program.functions.get('start1');
        let entryPointName = 'start1';

        if (!startFunction) {
            startFunction = program.functions.get('start2');
            entryPointName = 'start2';
        }

        if (!startFunction) {
            startFunction = program.functions.get('main');
            entryPointName = 'main';
        }

        if (!startFunction || startFunction.blocks.length === 0) {
            const availableFunctions = Array.from(program.functions.keys());
            throw new Error(
                `Program must have a start1, start2, or main function with at least one block. ` +
                    `Available functions: ${availableFunctions.join(', ')}`,
            );
        }

        this.context.instructionPointer = {
            functionName: entryPointName,
            blockLabel: startFunction.blocks[0].label,
            instructionIndex: 0,
        };
    }

    /**
     * Run the entire program to completion.
     */
    run(): void {
        if (!this.context) {
            throw new Error('No program loaded. Call load() first.');
        }

        while (!this.context.isHalted) {
            this.step();
        }
    }

    /**
     * Execute a single instruction.
     */
    step(): void {
        if (!this.context) {
            throw new Error('No program loaded. Call load() first.');
        }

        if (this.context.isHalted) {
            return;
        }

        const instruction = this.getCurrentInstruction();
        if (!instruction) {
            this.handleEndOfFunction();
            return;
        }

        const beforeIP = {
            functionName: this.context.instructionPointer.functionName,
            blockLabel: this.context.instructionPointer.blockLabel,
            instructionIndex: this.context.instructionPointer.instructionIndex,
        };

        instruction.execute(this.context);

        const afterIP = this.context.instructionPointer;
        if (
            afterIP.functionName === beforeIP.functionName &&
            afterIP.blockLabel === beforeIP.blockLabel &&
            afterIP.instructionIndex === beforeIP.instructionIndex
        ) {
            this.advanceInstructionPointer();
        }
    }

    /**
     * Get the current instruction based on the instruction pointer.
     */
    private getCurrentInstruction(): IRInstruction | null {
        if (!this.context) {
            return null;
        }

        const { functionName, blockLabel, instructionIndex } = this.context.instructionPointer;
        const func = this.context.program.functions.get(functionName);
        if (!func) {
            return null;
        }

        const block = func.blocks.find((b: { label: string }) => b.label === blockLabel);
        if (!block) {
            return null;
        }

        if (instructionIndex >= block.instructions.length) {
            return null;
        }

        return block.instructions[instructionIndex];
    }

    /**
     * Advance the instruction pointer to the next instruction in the current block.
     */
    private advanceInstructionPointer(): void {
        if (!this.context) {
            return;
        }

        this.context.instructionPointer.instructionIndex++;
    }

    /**
     * Handle the end of a function (implicit return).
     */
    private handleEndOfFunction(): void {
        if (!this.context) {
            return;
        }

        if (this.context.callStack.length === 0) {
            this.context.isHalted = true;
            return;
        }

        const completedFrame = this.context.callStack.pop()!;

        this.context.instructionPointer.functionName = completedFrame.returnAddress.functionName;
        this.context.instructionPointer.blockLabel = completedFrame.returnAddress.blockLabel;
        this.context.instructionPointer.instructionIndex =
            completedFrame.returnAddress.instructionIndex;

        // TODO: Handle return value assignment to destinationVariable
        // For now, we'll skip this since our mock functions don't return meaningful values

        this.advanceInstructionPointer();
    }

    /**
     * Get the current execution context (for testing).
     */
    getContext(): ExecutionContext | null {
        return this.context;
    }
}
