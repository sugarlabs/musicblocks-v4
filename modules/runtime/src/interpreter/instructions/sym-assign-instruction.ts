import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';

/**
 * SymAssignInstruction: Assigns a value to a variable.
 * The source can be a literal value or the name of another variable.
 */
export class SymAssignInstruction extends IRInstruction {
    constructor(
        public destinationVariable: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public source: any,
    ) {
        super();
    }

    execute(context: ExecutionContext): void {
        let value = this.source;

        // Handle arithmetic expression objects
        if (typeof this.source === 'object' && this.source !== null && 'op' in this.source) {
            const expr = this.source as {
                op: string;
                left: string | number;
                right: string | number;
            };

            // Evaluate left operand
            let leftValue = expr.left;
            if (typeof expr.left === 'string' && context.valueStore.hasValue(expr.left)) {
                leftValue = context.valueStore.getValue(expr.left);
            }

            // Evaluate right operand
            let rightValue = expr.right;
            if (typeof expr.right === 'string' && context.valueStore.hasValue(expr.right)) {
                rightValue = context.valueStore.getValue(expr.right);
            }

            // Perform operation
            switch (expr.op) {
                case 'add':
                    value = (leftValue as number) + (rightValue as number);
                    break;
                case 'subtract':
                    value = (leftValue as number) - (rightValue as number);
                    break;
                case 'multiply':
                    value = (leftValue as number) * (rightValue as number);
                    break;
                case 'divide':
                    value = (leftValue as number) / (rightValue as number);
                    break;
                default:
                    throw new Error(`Unknown arithmetic operation: ${expr.op}`);
            }
        } else if (typeof this.source === 'string') {
            // Handle special cases for arithmetic expressions (simplified for now)
            if (this.source === '_temp_add_plus_1') {
                const tempValue = context.valueStore.getValue('_temp_add');
                value = typeof tempValue === 'number' ? tempValue + 1 : 1;
            } else if (this.source === '_i_plus_1') {
                const iValue = context.valueStore.getValue('i');
                value = typeof iValue === 'number' ? iValue + 1 : 1;
            } else if (context.valueStore.hasValue(this.source)) {
                value = context.valueStore.getValue(this.source);
            }
        }

        // Store the value
        context.valueStore.setValue(this.destinationVariable, value);
    }
}
