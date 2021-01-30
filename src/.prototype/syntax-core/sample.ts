import { DataElement } from './programElements/dataElements';
import { ValueElement } from './programElements/valueElements';
import { ConditionalElement } from './programElements/conditionalElements';
import { OperationElement } from './programElements/operationElements';
import { MiscellaneousElement } from './programElements/miscellaneousElements';
import { BlockElement, InstructionElement, StatementElement } from './structureElements';
import { LoopElement } from './programElements/loopElements';

// ---- Execution utilities ------------------------------------------------------------------------

function executeStatement(instruction: InstructionElement) {
    instruction.onVisit();
}

function executeBlock(instruction: BlockElement) {
    instruction.onVisit();
    let next: InstructionElement | null = instruction.childHead;
    while (next !== null) {
        if (next instanceof StatementElement) {
            executeStatement(next);
        } else if (next instanceof BlockElement) {
            executeBlock(next);
        }
        next = next.next;
    }
    instruction.onExit();
}

function executeInstruction(instruction: InstructionElement | null) {
    if (instruction instanceof StatementElement) {
        executeStatement(instruction);
    } else if (instruction instanceof BlockElement) {
        executeBlock(instruction);
    } else {
        return;
    }
    executeInstruction(instruction.next);
}

// ---- Sample program -----------------------------------------------------------------------------

/**
 * Prints the n-th fibonacci number starting from 0
 * @param n - value of n, the required fibonacci number's index
 */
function fibN(N: number) {
    /*
    Implementation of:

    LINE  0:    void fibN(int N) {
    LINE  1:        int n = N;
    LINE  2:        if (n == 0 || n == 1) {
    LINE  3:            print(n);
    LINE  4:        } else {
    LINE  5:            int a = 0;
    LINE  6:            int b = 1;
    LINE  7:            int c = 0;
    LINE  8:            for (int i = 1; i <= n - 1; i++) {
    LINE  9:                c = a + b;
    LINE 10:                a = b;
    LINE 11:                b = c;
    LINE 12:            }
    LINE 13:            print(b);
    LINE 14:        }
    LINE 15:    }

     */

    // As per the code above, all data elements are integers, however floats have been used below
    // since operator overloading hasn't been handled effectively so far. Functionality is
    // effectively analogous though.

    // LINE 1:
    // -------------------------------------------------------------------------
    // Create a 'data' element of type 'TFloat'
    const nData = new DataElement.FloatDataElement();
    // Assign identifier as 'n' (not being used yet)
    nData.argIdentifier = new ValueElement.StringElement('n');
    // Assign N (argument to function) as value argument
    nData.argValue = new ValueElement.IntElement(N);

    // LINE 2:
    // -------------------------------------------------------------------------
    // Create an 'if-else' block element
    const ifElse = new ConditionalElement.IfElseElement();
    // Create an 'or' expression element
    const orElem = new OperationElement.OrElement();
    // Create an 'equals' expression element
    const eq_1 = new OperationElement.EqualsElement();
    // Create another 'equals' expression element
    const eq_2 = new OperationElement.EqualsElement();
    // Assign 'value' element corresponding to 'n' as first operand of one of the 'equals' element
    eq_1.argOperand_1 = nData.valueElement;
    // Assign '0' as second operand of the 'equals' element
    eq_1.argOperand_2 = new ValueElement.IntElement(0);
    // Assign 'value' element corresponding to 'n' as first operand of the other 'equals' element
    eq_2.argOperand_1 = nData.valueElement;
    // Assign '1' as second operand of the 'equals' element
    eq_2.argOperand_2 = new ValueElement.IntElement(1);
    // Assign one of the 'equals' element as first operand of the 'or' element
    orElem.argOperand_1 = eq_1;
    // Assign the other 'equals' element as second operand of the 'or' element
    orElem.argOperand_2 = eq_2;
    // Assign the 'or' element as condition argument of the 'if-else' element
    ifElse.argCondition = orElem;

    // LINE 3:
    // -------------------------------------------------------------------------
    // Create a 'print' element
    const print_1 = new MiscellaneousElement.PrintElement();
    // Assign 'value' element of 'n' as message argument of the 'print' element
    print_1.argMessage = nData.valueElement;

    // LINE 5:
    // -------------------------------------------------------------------------
    // Create a 'data' element of type 'TFloat'
    const aData = new DataElement.FloatDataElement();
    // Assign identifier as 'a' (not being used yet)
    aData.argIdentifier = new ValueElement.StringElement('a');
    // Assign '0' as value argument
    aData.argValue = new ValueElement.IntElement(0);

    // LINE 6:
    // -------------------------------------------------------------------------
    // Create a 'data' element of type 'TFloat'
    const bData = new DataElement.FloatDataElement();
    // Assign identifier as 'b' (not being used yet)
    bData.argIdentifier = new ValueElement.StringElement('b');
    // Assign '1' as value argument
    bData.argValue = new ValueElement.IntElement(1);

    // LINE 7:
    // -------------------------------------------------------------------------
    // Create a 'data' element of type 'TFloat'
    const cData = new DataElement.FloatDataElement();
    // Assign identifier as 'c' (not being used yet)
    cData.argIdentifier = new ValueElement.StringElement('c');
    // Assign '0' as value argument
    cData.argValue = new ValueElement.IntElement(0);

    // LINE 8:
    // -------------------------------------------------------------------------
    // Create a 'repeat' element
    const repeat = new LoopElement.RepeatLoopElement();
    // Create a 'subtraction' expression element
    const sub = new OperationElement.SubtractElement();
    // Assign 'value' element corresponding to 'n' as first operand of the 'subtraction' element
    sub.argOperand_1 = nData.valueElement;
    // Assign '1' as second operand of the 'subtraction' element
    sub.argOperand_2 = new ValueElement.IntElement(1);
    // Assign the 'subtraction' element as value argument of the 'repeat' element
    repeat.argValue = sub;

    // Create a 'value' element corresponding to the data element 'a'
    const a_data_value = aData.valueElement;
    // Create a 'value' element corresponding to the data element 'b'
    const b_data_value = bData.valueElement;
    // Create a 'value' element corresponding to the data element 'c'
    const c_data_value = cData.valueElement;

    // LINE 9:
    // -------------------------------------------------------------------------
    // Create an 'update' data element of type 'TFloat'
    const update_c = new DataElement.UpdateFloatDataElement();
    // Assign 'value' element corresponding to 'a' as current value argument of the 'update' element
    update_c.argCurrValue = cData.valueElement;
    // Create an 'addition' expression element
    const add = new OperationElement.AddElement();
    // Assign 'value' element corresponding to 'a' as first operand of the 'addition' element
    add.argOperand_1 = a_data_value;
    // Assign 'value' element corresponding to 'b' as second operand of the 'addition' element
    add.argOperand_2 = b_data_value;
    // Assign the 'addition' element as new value argument of the 'update' element
    update_c.argNewValue = add;

    // LINE 10:
    // -------------------------------------------------------------------------
    // Create an 'update' data element of type 'TFloat'
    const update_a = new DataElement.UpdateFloatDataElement();
    // Assign 'value' element corresponding to 'a' as current value argument of the 'update' element
    update_a.argCurrValue = a_data_value;
    // Assign 'value' element corresponding to 'b' as new value argument of the 'update' element
    update_a.argNewValue = b_data_value;

    // LINE 11:
    // -------------------------------------------------------------------------
    // Create an 'update' data element of type 'TFloat'
    const update_b = new DataElement.UpdateFloatDataElement();
    // Assign 'value' element corresponding to 'b' as current value argument of the 'update' element
    update_b.argCurrValue = b_data_value;
    // Assign 'value' element corresponding to 'c' as new value argument of the 'update' element
    update_b.argNewValue = c_data_value;

    // LINE 13:
    // -------------------------------------------------------------------------
    // Create a 'print' element
    const print_2 = new MiscellaneousElement.PrintElement();
    // Assign 'value' element of 'b' as message argument of the 'print' element
    print_2.argMessage = bData.valueElement;

    // -------------------------------------------------------------------------
    // Connecting the elements linearly to form the instruction pipeline of the program
    // -------------------------------------------------------------------------
    // LINE 1 is followed by LINE 2
    nData.next = ifElse;
    // LINE 2 ('if-else' element)'s head instruction in first (of 2) block ('if') is LINE 3
    ifElse.setChildHead(0, print_1);
    // LINE 2 ('if-else' element)'s head instruction in second (of 2) block ('else') is LINE 5
    ifElse.setChildHead(1, aData);
    // LINE 5 is followed by LINE 6
    aData.next = bData;
    // LINE 6 is followed by LINE 7
    bData.next = cData;
    // LINE 7 is followed by LINE 8
    cData.next = repeat;
    // LINE 8 ('repeat' element)'s head instruction in first (of 1) block is LINE 9
    repeat.setChildHead(0, update_c);
    // LINE 9 is followed by LINE 10
    update_c.next = update_a;
    // LINE 10 is followed by LINE 11
    update_a.next = update_b;
    // LINE 11 is last instruction in its parent block
    update_b.next = null;
    // LINE 8 ('repeat' element) is followed by LINE 13
    repeat.next = print_2;
    // LINE 13 is last instruction in its parent block
    print_2.next = null;
    // LINE 2 ('if-else' element)'s instruction is last instruction in its parent block
    ifElse.next = null;

    // Dummy separator for readability
    console.log(`----- fib(${N})`);
    // Execute the pipeline starting from LINE 1
    executeInstruction(nData);
}

// ---- Invoke the function call for the sample program --------------------------------------------

fibN(0); // prints the 0th fibonacci number = 0
fibN(1); // prints the 1st fibonacci number = 1
fibN(2); // prints the 2nd fibonacci number = 1
fibN(3); // prints the 3rd fibonacci number = 2
fibN(4); // prints the 4th fibonacci number = 3
fibN(5); // prints the 5th fibonacci number = 5
fibN(6); // prints the 6th fibonacci number = 8
fibN(7); // prints the 7th fibonacci number = 13
fibN(8); // prints the 8th fibonacci number = 21
fibN(9); // prints the 9th fibonacci number = 34
