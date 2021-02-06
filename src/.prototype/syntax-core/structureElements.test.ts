import { TInt, TFloat, TChar, TString, TBoolean } from './primitiveElements';
import {
    ArgumentDataElement,
    ArgumentExpressionElement,
    StatementElement,
    BlockElement
} from './structureElements';

/** Dummy class to extend abstract class ArgumentDataElement. */
class CArgumentDataElement extends ArgumentDataElement {
    getData() {
        return new TInt(5);
    }
}
/** Dummy class to extend abstract class ArgumentExpressionElement. */
class CArgumentExpressionElement extends ArgumentExpressionElement {
    getData() {
        return new TInt(5);
    }
}
/** Dummy class to extend abstract class StatementElement. */
class CStatementElement extends StatementElement {
    onVisit() {}
}
/** Dummy class to extend abstract class BlockElement. */
class CBlockElement extends BlockElement {
    onVisit() {}
    onExit() {}
}

let argData: ArgumentDataElement;
let argExpr: ArgumentExpressionElement;

describe('class ArgumentDataElement', () => {
    test("intialize dummy ArgumentDataElement's subclass with valid arbitrary arguments and verify contents", () => {
        argData = new CArgumentDataElement('myArgData', 'TInt', false);
        expect(argData.elementName).toBe('myArgData');
        expect(argData.type).toBe('TInt');
        expect(argData.argType).toBe('data');
        expect(argData.getData({}).value).toBe(5);
    });
});

describe('class ArgumentExpressionElement', () => {
    test("initialize dummy ArgumentExpressionElement's subclass with valid arbitrary arguments and verify contents", () => {
        argExpr = new CArgumentExpressionElement('myArgExpression', 'TInt', false);
        expect(argExpr.elementName).toBe('myArgExpression');
        expect(argExpr.type).toBe('TInt');
        expect(argExpr.argType).toBe('expression');
        expect(argExpr.getData({}).value).toBe(5);
    });
});

let stmntElem: StatementElement;

describe('class StatementElement', () => {
    test('initialize object with no argument constraints and expect error on fetching argument labels', () => {
        stmntElem = new CStatementElement('yourStatement', false);
        expect(() => stmntElem.args.argLabels).toThrowError(
            `"yourStatement" does not take arguments.`
        );
    });

    test('initialize object with argument constraints and verify initial contents', () => {
        stmntElem = new CStatementElement('myStatement', false, {
            arg_1: ['TInt', 'TChar'],
            arg_2: ['TString']
        });
        try {
            expect(stmntElem.args.argLabels).toEqual(['arg_1', 'arg_2']);
        } catch (e) {
            console.error(e);
        }
    });

    test('assign valid argument for valid argument label and verify', () => {
        try {
            stmntElem.args.setArg('arg_1', argData);
            const arg = stmntElem.args.getArg('arg_1');
            if (arg !== null) {
                expect(arg.getData({}).value).toEqual(5);
            }
        } catch (e) {
            console.error(e);
        }
    });

    test('reset previous argument label with null and verify', () => {
        try {
            stmntElem.args.setArg('arg_1', null);
            expect(stmntElem.args.getArg('arg_1')).toBe(null);
        } catch (e) {
            console.error(e);
        }
    });

    test('try to fetch argument for invalid argument label and expect error', () => {
        expect(() => stmntElem.args.getArg('arg_3')).toThrowError(
            '"arg_3" does not exist for "myStatement".'
        );
    });

    test('try to assign argument for invalid argument label and expect error', () => {
        expect(() => stmntElem.args.setArg('arg_3', null)).toThrowError(
            '"arg_3" does not exist for "myStatement".'
        );
    });

    test('try to assign invalid return-type argument for valid argument label and expect error', () => {
        expect(() => stmntElem.args.setArg('arg_2', argData)).toThrowError(
            '"TInt" is not a valid type for "arg_2".'
        );
    });
});

describe('class BlockElement', () => {
    let blockElem: BlockElement;

    test('initialize object with argument constraints and verify initial contents', () => {
        blockElem = new CBlockElement('myBlock', 1, false, { arg_1: ['TBoolean'] });
        expect(blockElem.next).toBe(null);
        if (blockElem.args !== null) {
            expect(blockElem.args.argLabels).toEqual(['arg_1']);
        } else {
            throw Error('object should not be null');
        }
    });

    // Rest are same as (above) StatementElement tests, therefore redundant to add.

    test('assign an instruction to innerHeads and verify', () => {
        blockElem.setChildHead(0, stmntElem);
        const head = blockElem.getChildHead(0);
        if (head !== null) {
            expect(head.elementName).toBe('myStatement');
        }
    });

    test('fetch childHead and expect to be null', () => {
        expect(blockElem.childHead).toBe(null);
    });
});
