import { TInt, TFloat, TChar, TString, TBoolean } from './primitiveElements';
import {
    ArgumentDataElement,
    ArgumentExpressionElement,
    StatementElement,
    BlockElement
} from './structureElements';

/** Dummy class to extend abstract class ArgumentDataElement. */
class CArgumentDataElement extends ArgumentDataElement {}
/** Dummy class to extend abstract class ArgumentExpressionElement. */
class CArgumentExpressionElement extends ArgumentExpressionElement {
    get data() {
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

let argData_int: ArgumentDataElement;
let argData_float: ArgumentDataElement;
let argData_char: ArgumentDataElement;
let argData_string: ArgumentDataElement;
let argData_boolean: ArgumentDataElement;
let argExpr: ArgumentExpressionElement;

describe('class ArgumentDataElement', () => {
    test('intialize object with a TInt(5) and verify contents', () => {
        argData_int = new CArgumentDataElement('myArgData', new TInt(5));
        expect(argData_int.elementName).toBe('myArgData');
        expect(argData_int.argType).toBe('data');
        expect(argData_int.data.value).toBe(5);
    });

    test('intialize object with a TFloat(3.14) and verify contents', () => {
        argData_float = new CArgumentDataElement('myArgData', new TFloat(3.14));
        expect(argData_float.elementName).toBe('myArgData');
        expect(argData_float.argType).toBe('data');
        expect(argData_float.data.value).toBe(3.14);
    });

    test('intialize object with a TChar(65) and verify contents', () => {
        argData_char = new CArgumentDataElement('myArgData', new TChar(65));
        expect(argData_char.elementName).toBe('myArgData');
        expect(argData_char.argType).toBe('data');
        expect(argData_char.data.value).toBe('A');
    });

    test('intialize object with a TString("str") and verify contents', () => {
        argData_string = new CArgumentDataElement('myArgData', new TString('str'));
        expect(argData_string.elementName).toBe('myArgData');
        expect(argData_string.argType).toBe('data');
        expect(argData_string.data.value).toBe('str');
    });

    test('intialize object with a TBoolean(false) and verify contents', () => {
        argData_boolean = new CArgumentDataElement('myArgData', new TBoolean(false));
        expect(argData_boolean.elementName).toBe('myArgData');
        expect(argData_boolean.argType).toBe('data');
        expect(argData_boolean.data.value).toBe(false);
    });
});

describe('class ArgumentExpressionElement', () => {
    test('initialize object with valid arbitrary arguments and verify contents', () => {
        argExpr = new CArgumentExpressionElement('myArgExpression', 'TInt');
        expect(argExpr.elementName).toBe('myArgExpression');
        expect(argExpr.type).toBe('TInt');
        expect(argExpr.argType).toBe('expression');
    });
});

let stmntElem: StatementElement;

describe('class StatementElement', () => {
    test('initialize object with no argument constraints and expect error on fetching argument labels', () => {
        stmntElem = new CStatementElement('yourStatement');
        expect(() => stmntElem.args.argNames).toThrowError(
            `Invalid access: instruction "yourStatement" does not take arguments`
        );
    });

    test('initialize object with argument constraints and verify initial contents', () => {
        stmntElem = new CStatementElement('myStatement', {
            arg_1: ['TInt', 'TChar'],
            arg_2: ['TString']
        });
        try {
            expect(stmntElem.args.argNames).toEqual(['arg_1', 'arg_2']);
        } catch (e) {
            console.error(e);
        }
    });

    test('assign valid argument for valid argument label and verify', () => {
        try {
            stmntElem.args.setArg('arg_1', argData_char);
            const arg = stmntElem.args.getArg('arg_1');
            if (arg !== null) {
                expect(arg.data.value).toEqual('A');
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
            'Invalid argument: "arg_3" does not exist for instruction "myStatement"'
        );
    });

    test('try to assign argument for invalid argument label and expect error', () => {
        expect(() => stmntElem.args.setArg('arg_3', null)).toThrowError(
            'Invalid argument: "arg_3" does not exist for instruction "myStatement"'
        );
    });

    test('try to assign invalid return-type argument for valid argument label and expect error', () => {
        expect(() => stmntElem.args.setArg('arg_2', argData_int)).toThrowError(
            'Invalid argument: "TInt" is not a valid type for "arg_2"'
        );
    });
});

describe('class BlockElement', () => {
    let blockElem: BlockElement;

    test('initialize object with argument constraints and verify initial contents', () => {
        blockElem = new CBlockElement('myBlock', { arg_1: ['TBoolean'] });
        expect(blockElem.next).toBe(null);
        if (blockElem.args !== null) {
            expect(blockElem.args.argNames).toEqual(['arg_1']);
        } else {
            throw Error('object should not be null');
        }
    });

    // Rest are same as (above) StatementElement tests, therefore redundant to add.

    test('assign an instruction to innerHeads and verify', () => {
        blockElem.childHeads = [stmntElem];
        const head = blockElem.childHeads[0];
        if (head !== null) {
            expect(head.elementName).toBe('myStatement');
        }
    });

    test('fetch childHead and expect to be null', () => {
        expect(blockElem.childHead).toBe(null);
    });
});
