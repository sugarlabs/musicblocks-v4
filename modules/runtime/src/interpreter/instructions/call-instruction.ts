import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';
import { StackFrame } from '../stack-frame';
import { SymbolTable } from '../../execution/scope/symbol-table';

/**
 * CallInstruction handles both function calls and host function calls in the IR interpreter.
 * It manages function parameters, creates new stack frames for function calls,
 * and executes host functions directly.
 */
export class CallInstruction extends IRInstruction {
    public functionName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public parameters: any[];
    public isHostFunction: boolean;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(functionName: string, parameters: any[] = [], isHostFunction: boolean = true) {
        super();
        this.functionName = functionName;
        this.parameters = parameters;
        this.isHostFunction = isHostFunction;
    }

    execute(context: ExecutionContext): void {
        if (this.isHostFunction) {
            this.executeHostFunction(context);
        } else {
            this.executeFunctionCall(context);
        }
    }

    private executeHostFunction(context: ExecutionContext): void {
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

        if (this.functionName === 'console.log') {
            console.log(...parameterValues);
        } else {
            console.log(`Call: ${this.functionName} with args: ${JSON.stringify(parameterValues)}`);
        }

        context.instructionPointer.instructionIndex++;
    }

    private executeFunctionCall(context: ExecutionContext): void {
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
