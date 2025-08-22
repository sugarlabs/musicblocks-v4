import { IRProgram } from './ir-program';
import { ExecutionContext } from './execution-context';
import { IRInstruction } from './instructions/ir-instruction';
import { IExternalFunctionRegistry } from '../execution/external-function-registry';

export type ExecutionStatus =
    | { status: 'COMPLETED_SLICE' }
    | { status: 'BLOCKED_ON_TIME'; duration: number }
    | { status: 'THREAD_HALTED' };

/**
 * IRInterpreter executes IR programs step by step.
 */
export class IRInterpreter {
    private context: ExecutionContext | null = null;
    private externalFunctions?: IExternalFunctionRegistry;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private functionRegistry: Map<string, (...args: any[]) => any>;

    constructor(
        externalFunctionsOrRegistry?:
            | IExternalFunctionRegistry
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            | Map<string, (...args: any[]) => any>,
    ) {
        if (externalFunctionsOrRegistry instanceof Map) {
            this.functionRegistry = externalFunctionsOrRegistry;
            // Create a wrapper registry for the Map
            this.externalFunctions = {
                hasFunction: (name: string) => this.functionRegistry.has(name),
                executeFunction: (name: string, args: unknown[]) => {
                    const fn = this.functionRegistry.get(name);
                    if (fn) {
                        return fn(...args);
                    }
                    return undefined;
                },
            };
        } else {
            this.externalFunctions = externalFunctionsOrRegistry;
            this.functionRegistry = new Map();
        }
    }

    /**
     * Load a program into the interpreter.
     */
    load(program: IRProgram): void {
        this.context = new ExecutionContext(program, this.externalFunctions);

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
     * Execute up to `sliceSize` instructions for the given context.
     * Returns a status indicating why execution stopped.
     */
    public executeSlice(context: ExecutionContext, sliceSize: number): ExecutionStatus {
        let instructionsExecuted = 0;

        while (instructionsExecuted < sliceSize && !context.isHalted) {
            const instruction = this.getCurrentInstructionForContext(context);
            if (!instruction) {
                this.handleEndOfFunctionForContext(context);
                if (context.isHalted) {
                    return { status: 'THREAD_HALTED' };
                }
                continue;
            }

            const beforeIP = {
                functionName: context.instructionPointer.functionName,
                blockLabel: context.instructionPointer.blockLabel,
                instructionIndex: context.instructionPointer.instructionIndex,
            };

            // Clear any previous blocking result
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (context as any).__blockingResult = undefined;

            // Execute the instruction
            instruction.execute(context);

            // Check for blocking operations after executing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const blockingResult = (context as any).__blockingResult;
            if (blockingResult && typeof blockingResult === 'object') {
                // Handle both old format (__isBlocking) and new format (type)
                if ('__isBlocking' in blockingResult && blockingResult.__isBlocking) {
                    return { status: 'BLOCKED_ON_TIME', duration: blockingResult.duration || 1000 };
                } else if ('type' in blockingResult && blockingResult.type === 'time') {
                    return { status: 'BLOCKED_ON_TIME', duration: blockingResult.duration || 1000 };
                }
            }

            const afterIP = context.instructionPointer;
            if (
                afterIP.functionName === beforeIP.functionName &&
                afterIP.blockLabel === beforeIP.blockLabel &&
                afterIP.instructionIndex === beforeIP.instructionIndex
            ) {
                this.advanceInstructionPointerForContext(context);
            }

            instructionsExecuted++;
        }

        if (context.isHalted) {
            return { status: 'THREAD_HALTED' };
        }

        return { status: 'COMPLETED_SLICE' };
    }

    /**
     * Get the current instruction based on the instruction pointer.
     */
    private getCurrentInstruction(): IRInstruction | null {
        if (!this.context) {
            return null;
        }
        return this.getCurrentInstructionForContext(this.context);
    }

    /**
     * Get the current instruction for a specific context.
     */
    private getCurrentInstructionForContext(context: ExecutionContext): IRInstruction | null {
        const { functionName, blockLabel, instructionIndex } = context.instructionPointer;
        const func = context.program.functions.get(functionName);
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
        this.advanceInstructionPointerForContext(this.context);
    }

    /**
     * Advance the instruction pointer for a specific context.
     */
    private advanceInstructionPointerForContext(context: ExecutionContext): void {
        context.instructionPointer.instructionIndex++;
    }

    /**
     * Handle the end of a function (implicit return).
     */
    private handleEndOfFunction(): void {
        if (!this.context) {
            return;
        }
        this.handleEndOfFunctionForContext(this.context);
    }

    /**
     * Handle the end of a function for a specific context.
     */
    private handleEndOfFunctionForContext(context: ExecutionContext): void {
        if (context.callStack.length === 0) {
            context.isHalted = true;
            return;
        }

        const completedFrame = context.callStack.pop()!;

        context.instructionPointer.functionName = completedFrame.returnAddress.functionName;
        context.instructionPointer.blockLabel = completedFrame.returnAddress.blockLabel;
        context.instructionPointer.instructionIndex = completedFrame.returnAddress.instructionIndex;

        // TODO: Handle return value assignment to destinationVariable
        // For now, we'll skip this since our mock functions don't return meaningful values

        this.advanceInstructionPointerForContext(context);
    }

    /**
     * Get the current execution context (for testing).
     */
    getContext(): ExecutionContext | null {
        return this.context;
    }
}
