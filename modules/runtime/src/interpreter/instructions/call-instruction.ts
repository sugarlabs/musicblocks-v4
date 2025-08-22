import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';
import { StackFrame } from '../stack-frame';
import { SymbolTable } from '../../execution/scope/symbol-table';

/**
 * CallInstruction handles function calls in the IR interpreter.
 * It manages function parameters and delegates execution to either
 * user-defined functions or external functions.
 */
export class CallInstruction extends IRInstruction {
    public functionName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public parameters: any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(functionName: string, parameters: any[] = []) {
        super();
        this.functionName = functionName;
        this.parameters = parameters;
    }

    execute(context: ExecutionContext): void {
        if (context.program.functions.has(this.functionName)) {
            this.executeUserFunction(context);
        } else if (context.externalFunctions.hasFunction(this.functionName)) {
            const result = this.executeExternalFunction(context);
            // Check for blocking operation result
            if (
                result &&
                typeof result === 'object' &&
                ('__isBlocking' in result || 'type' in result)
            ) {
                // Store blocking information for scheduler detection
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (context as any).__blockingResult = result;
            }
        } else {
            throw new Error(`Function '${this.functionName}' not found`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private executeExternalFunction(context: ExecutionContext): any {
        const parameterValues: unknown[] = [];
        for (const param of this.parameters) {
            if (typeof param === 'number' || typeof param === 'boolean') {
                parameterValues.push(param);
            } else if (typeof param === 'string') {
                if (this.isLiteral(param)) {
                    parameterValues.push(this.parseLiteral(param));
                } else {
                    try {
                        const value = context.valueStore.getValue(param);
                        if (value !== undefined && value !== null) {
                            parameterValues.push(value);
                        } else {
                            parameterValues.push(param);
                        }
                    } catch {
                        parameterValues.push(param);
                    }
                }
            } else {
                parameterValues.push(param);
            }
        }

        // Execute external function (mock for now)
        const result = context.externalFunctions.executeFunction(
            this.functionName,
            parameterValues,
        );
        context.instructionPointer.instructionIndex++;
        return result;
    }

    private executeUserFunction(context: ExecutionContext): void {
        const parameterValues: unknown[] = [];
        for (const param of this.parameters) {
            if (typeof param === 'number' || typeof param === 'boolean') {
                parameterValues.push(param);
            } else if (typeof param === 'string') {
                if (this.isLiteral(param)) {
                    parameterValues.push(this.parseLiteral(param));
                } else {
                    const value = context.valueStore.getValue(param);
                    parameterValues.push(value);
                }
            } else {
                parameterValues.push(param);
            }
        }

        // Create a new local scope for the function
        const _parentScope = context.getCurrentSymbolTable();
        const localScope = new SymbolTable();

        // Create return address (current instruction pointer, will be advanced by handleEndOfFunction)
        const returnAddress = {
            functionName: context.instructionPointer.functionName,
            blockLabel: context.instructionPointer.blockLabel,
            instructionIndex: context.instructionPointer.instructionIndex,
        };

        // Create new stack frame
        const stackFrame = new StackFrame(this.functionName, localScope, returnAddress);

        // Push the new frame onto the call stack
        context.callStack.push(stackFrame);

        // Update instruction pointer to jump to the called function
        context.instructionPointer = {
            functionName: this.functionName,
            blockLabel: 'entry',
            instructionIndex: 0,
        };
    }

    private isLiteral(value: string): boolean {
        // Check if it's a number, boolean, or string literal
        return /^(-?\d+\.?\d*|true|false|".*"|'.*')$/.test(value.trim());
    }

    private parseLiteral(value: string): unknown {
        const trimmed = value.trim();
        // Number
        if (/^-?\d+\.?\d*$/.test(trimmed)) {
            return parseFloat(trimmed);
        }
        // Boolean
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (
            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ) {
            return trimmed.slice(1, -1);
        }
        return trimmed;
    }
}
