import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';

/**
 * CompareJumpInstruction: Jumps to one of two blocks based on a condition.
 */
export class CompareJumpInstruction extends IRInstruction {
    constructor(
        public condition: string, // e.g., 'greaterThan', 'equal'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public operand1: any, // Can be a literal or a variable name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public operand2: any,
        public trueTargetLabel: string,
        public falseTargetLabel: string,
    ) {
        super();
    }

    execute(context: ExecutionContext): void {
        // Resolve operand values
        let value1 = this.operand1;
        let value2 = this.operand2;

        // If operand is a string, check if it's a variable name
        if (typeof this.operand1 === 'string' && context.valueStore.hasValue(this.operand1)) {
            value1 = context.valueStore.getValue(this.operand1);
        }
        if (typeof this.operand2 === 'string' && context.valueStore.hasValue(this.operand2)) {
            value2 = context.valueStore.getValue(this.operand2);
        }

        // Evaluate the condition
        let conditionResult = false;
        switch (this.condition) {
            case 'greaterThan':
                conditionResult = value1 > value2;
                break;
            case 'lessThan':
                conditionResult = value1 < value2;
                break;
            case 'equal':
                conditionResult = value1 === value2;
                break;
            case 'notEqual':
                conditionResult = value1 !== value2;
                break;
            case 'greaterThanOrEqual':
                conditionResult = value1 >= value2;
                break;
            case 'lessThanOrEqual':
                conditionResult = value1 <= value2;
                break;
            default:
                throw new Error(`Unknown condition: ${this.condition}`);
        }

        // Jump to the appropriate target
        const targetLabel = conditionResult ? this.trueTargetLabel : this.falseTargetLabel;
        context.instructionPointer.blockLabel = targetLabel;
        context.instructionPointer.instructionIndex = 0;
    }
}
