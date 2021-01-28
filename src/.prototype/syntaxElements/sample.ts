import { DataElement } from './programElements/dataElements';
import { ValueElement } from './programElements/valueElements';
import { ConditionalElement } from './programElements/conditionalElements';
import { OperationElement } from './programElements/operationElements';
import { MiscellaneousElement } from './programElements/miscellaneousElements';
import { BlockElement, InstructionElement, StatementElement } from './structureElements';
import { LoopElement } from './programElements/loopElements';

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

function fibN(n: number) {
    /*
    Implementation of:

    void fibN(int N) {
        int n = N;
        if (n == 0 || n == 1) {
            print(n);
        } else {
            int a = 0;
            int b = 0;
            int c = -1;
            for (int i = 1; i <= n - 1; i++) {
                c = a + b;
                a = b;
                b = c;
            }
            print(b);
        }
    }

     */

    const nData = new DataElement.FloatDataElement();
    nData.argIdentifier = new ValueElement.StringElement('n');
    nData.argValue = new ValueElement.IntElement(n);

    const ifElse_1 = new ConditionalElement.IfElseElement();
    const orElem = new OperationElement.OrElement();
    const eq_1 = new OperationElement.EqualsElement();
    const eq_2 = new OperationElement.EqualsElement();
    eq_1.argOperand_1 = nData.valueElement;
    eq_1.argOperand_2 = new ValueElement.IntElement(0);
    eq_2.argOperand_1 = nData.valueElement;
    eq_2.argOperand_2 = new ValueElement.IntElement(1);
    orElem.argOperand_1 = eq_1;
    orElem.argOperand_2 = eq_2;
    ifElse_1.argCondition = orElem;

    const print_1 = new MiscellaneousElement.PrintElement();
    print_1.argMessage = nData.valueElement;
    const print_2 = new MiscellaneousElement.PrintElement();
    print_2.argMessage = nData.valueElement;

    const aData = new DataElement.FloatDataElement();
    aData.argIdentifier = new ValueElement.StringElement('a');
    aData.argValue = new ValueElement.IntElement(0);

    const bData = new DataElement.FloatDataElement();
    bData.argIdentifier = new ValueElement.StringElement('b');
    bData.argValue = new ValueElement.IntElement(1);

    const cData = new DataElement.FloatDataElement();
    cData.argIdentifier = new ValueElement.StringElement('c');
    cData.argValue = new ValueElement.IntElement(-1);

    const sub = new OperationElement.SubtractElement();
    sub.argOperand_1 = nData.valueElement;
    sub.argOperand_2 = new ValueElement.IntElement(1);
    const repeat = new LoopElement.RepeatLoopElement();
    repeat.argValue = sub;

    const a_data_value = aData.valueElement;
    const b_data_value = bData.valueElement;
    const c_data_value = cData.valueElement;

    const update_c = new DataElement.UpdateFloatDataElement();
    update_c.argCurrValue = cData.valueElement;
    const add = new OperationElement.AddElement();
    add.argOperand_1 = a_data_value;
    add.argOperand_2 = b_data_value;
    update_c.argNewValue = add;

    const update_a = new DataElement.UpdateFloatDataElement();
    update_a.argCurrValue = a_data_value;
    update_a.argNewValue = b_data_value;
    const update_b = new DataElement.UpdateFloatDataElement();
    update_b.argCurrValue = b_data_value;
    update_b.argNewValue = c_data_value;

    const print_3 = new MiscellaneousElement.PrintElement();
    print_3.argMessage = bData.valueElement;

    nData.next = ifElse_1;
    ifElse_1.setChildHead(0, print_1);
    ifElse_1.setChildHead(1, aData);
    aData.next = bData;
    bData.next = cData;
    cData.next = repeat;
    repeat.setChildHead(0, update_c);
    update_c.next = update_a;
    update_a.next = update_b;
    repeat.next = print_3;

    console.log(`----- fib(${n})`);
    executeInstruction(nData);
}

fibN(0);
fibN(1);
fibN(2);
fibN(3);
fibN(4);
fibN(5);
fibN(6);
fibN(7);
fibN(8);
fibN(9);
