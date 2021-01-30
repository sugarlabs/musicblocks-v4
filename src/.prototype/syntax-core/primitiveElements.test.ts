import { TInt, TFloat, TChar, TString, TBoolean } from './primitiveElements';

describe('initialization and value verification', () => {
    test('assign 5 to TInt to equal 5', () => {
        const typeObj = new TInt(5);
        expect(typeObj.value).toBe(5);
    });

    test('assign Math.PI (3.1415..) to TInt to equal 3', () => {
        const typeObj = new TInt(Math.PI);
        expect(typeObj.value).toBe(3);
    });

    test('assign Math.E (2.7182..) to TFloat to equal Math.E', () => {
        const typeObj = new TFloat(Math.E);
        expect(typeObj.value).toBe(Math.E);
    });

    test('assign "mystring" to TChar to equal "m"', () => {
        const typeObj = new TChar('mystring');
        expect(typeObj.value).toBe('m');
    });

    test('assign "" to TChar to equal ASCII 0 character', () => {
        const typeObj = new TChar('');
        expect(typeObj.value).toBe(String.fromCharCode(0));
    });

    test('assign 65 to TChar to equal "A"', () => {
        const typeObj = new TChar(65);
        expect(typeObj.value).toBe('A');
    });

    test('assign 500 to TChar to equal ASCII 255 character', () => {
        const typeObj = new TChar(500);
        expect(typeObj.value).toBe(String.fromCharCode(255));
    });

    test('assign "mystring" to TString to equal "mystring"', () => {
        const typeObj = new TString('mystring');
        expect(typeObj.value).toBe('mystring');
    });

    test('assign true to TBoolean to equal true', () => {
        const typeObj = new TBoolean(true);
        expect(typeObj.value).toBe(true);
    });

    test('assign false to TBoolean to equal false', () => {
        const typeObj = new TBoolean(false);
        expect(typeObj.value).toBe(false);
    });
});

describe('type conversions', () => {
    const intType = new TInt(65);
    const floatType = new TFloat(3.1415);
    const charType = new TChar(97);
    const stringType = new TString('2.71828');

    describe('conversion to TInt', () => {
        test('convert TInt type to TInt and verify', () => {
            const newType = TInt.TInt(intType);
            expect(newType instanceof TInt).toBe(true);
            expect(newType.type).toBe('TInt');
            expect(newType.value).toBe(65);
        });

        test('convert TFloat type to TInt and verify', () => {
            const newType = TInt.TInt(floatType);
            expect(newType instanceof TInt).toBe(true);
            expect(newType.type).toBe('TInt');
            expect(newType.value).toBe(3);
        });

        test('convert TChar type to TInt and verify', () => {
            const newType = TInt.TInt(charType);
            expect(newType instanceof TInt).toBe(true);
            expect(newType.type).toBe('TInt');
            expect(newType.value).toBe(97);
        });

        test('convert number-convertible TString type to TInt and verify', () => {
            const newType = TInt.TInt(stringType);
            expect(newType instanceof TInt).toBe(true);
            expect(newType.type).toBe('TInt');
            expect(newType.value).toBe(2);
        });

        test('convert number-inconvertible TString type to TInt and expect error', () => {
            expect(() => TInt.TInt(new TString('string'))).toThrowError(
                'Invalid format: TString object does not represent a number'
            );
        });
    });

    describe('conversion to TFloat', () => {
        test('convert TFloat type to TFloat and verify', () => {
            const newType = TFloat.TFloat(floatType);
            expect(newType instanceof TFloat).toBe(true);
            expect(newType.type).toBe('TFloat');
            expect(newType.value).toBe(3.1415);
        });

        test('convert TInt type to TFloat and verify', () => {
            const newType = TFloat.TFloat(intType);
            expect(newType instanceof TFloat).toBe(true);
            expect(newType.type).toBe('TFloat');
            expect(newType.value).toBe(65);
        });

        test('convert number-convertible TString type to TFloat and verify', () => {
            const newType = TFloat.TFloat(stringType);
            expect(newType instanceof TFloat).toBe(true);
            expect(newType.type).toBe('TFloat');
            expect(newType.value).toBe(2.71828);
        });

        test('convert number-inconvertible TString type to TFloat and expect error', () => {
            expect(() => TFloat.TFloat(new TString('string'))).toThrowError(
                'Invalid format: TString object does not represent a number'
            );
        });
    });

    describe('conversion to TChar', () => {
        test('convert TChar type to TChar and verify', () => {
            const newType = TChar.TChar(charType);
            expect(newType instanceof TChar).toBe(true);
            expect(newType.type).toBe('TChar');
            expect(newType.value).toBe('a');
        });

        test('convert TInt type to TChar and verify', () => {
            const newType = TChar.TChar(intType);
            expect(newType instanceof TChar).toBe(true);
            expect(newType.type).toBe('TChar');
            expect(newType.value).toBe('A');
        });
    });

    describe('conversion to TString', () => {
        test('convert TString type to TString and verify', () => {
            const newType = TString.TString(stringType);
            expect(newType instanceof TString).toBe(true);
            expect(newType.type).toBe('TString');
            expect(newType.value).toBe('2.71828');
        });

        test('convert TInt type to TString and verify', () => {
            const newType = TString.TString(intType);
            expect(newType instanceof TString).toBe(true);
            expect(newType.type).toBe('TString');
            expect(newType.value).toBe('65');
        });

        test('convert TFloat type to TString and verify', () => {
            const newType = TString.TString(floatType);
            expect(newType instanceof TString).toBe(true);
            expect(newType.type).toBe('TString');
            expect(newType.value).toBe('3.1415');
        });

        test('convert TChar type to TString and verify', () => {
            const newType = TString.TString(charType);
            expect(newType instanceof TString).toBe(true);
            expect(newType.type).toBe('TString');
            expect(newType.value).toBe('a');
        });
    });
});

describe('operations on type elements', () => {

    describe('class TInt', () => {
        test('add TInt(15) and TInt(4) and expect new element value to be 19', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            operand_1.add(operand_2);
            expect(operand_1.value).toBe(19);
        });

        test('add TInt(15) and TInt(4) and expect new element value to be 19', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.add(operand_1, operand_2).value).toBe(19);
        });

        test('subtract TInt(15) and TInt(4) and expect new element value to be 11', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            operand_1.subtract(operand_2);
            expect(operand_1.value).toBe(11);
        });

        test('subtract TInt(15) and TInt(4) and expect new element value to be 11', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.subtract(operand_1, operand_2).value).toBe(11);
        });

        test('multiply TInt(15) and TInt(4) and expect new element value to be 60', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            operand_1.multiply(operand_2);
            expect(operand_1.value).toBe(60);
        });

        test('multiply TInt(15) and TInt(4) and expect new element value to be 60', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.multiply(operand_1, operand_2).value).toBe(60);
        });

        test('divide TInt(15) and TInt(4) and expect new element value to be 3', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            operand_1.divide(operand_2);
            expect(operand_1.value).toBe(3);
        });

        test('divide TInt(15) and TInt(4) and expect new element value to be 3', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.divide(operand_1, operand_2).value).toBe(3);
        });

        test('mod TInt(15) and TInt(4) and expect new element value to be 3', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.mod(operand_1, operand_2).value).toBe(3);
        });

        test('check for equality TInt(15) and TInt(4) and expect to get False', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.equals(operand_1, operand_2).value).toBe(false);
        });

        test('check for equality TInt(4) and TInt(4) and expect to get True', () => {
            const operand_1 = new TInt(4);
            const operand_2 = new TInt(4);
            expect(TInt.equals(operand_1, operand_2).value).toBe(true);
        });

        test('check if TInt(15) greater than TInt(4) and expect to get True', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.greaterThan(operand_1, operand_2).value).toBe(true);
        });

        test('check if TInt(15) less than TInt(4) and expect to get False', () => {
            const operand_1 = new TInt(15);
            const operand_2 = new TInt(4);
            expect(TInt.lessThan(operand_1, operand_2).value).toBe(false);
        });

        test('increment a TInt(15) object and expect value to be 16', () => {
            const operand_1 = new TInt(15);
            operand_1.increment();
            expect(operand_1.value).toBe(16);
        });

        test('decrement a TInt(16) object and expect value to be 15', () => {
            const operand_1 = new TInt(16);
            operand_1.decrement();
            expect(operand_1.value).toBe(15);
        });
    });


    describe('class TFloat', () => {

        test('add TFloat(15.5) and TInt(4) and expect new element value to be 19.5', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            operand_3.add(operand_2);
            expect(operand_3.value).toBe(19.5);
        });

        test('add TFloat(15.5) and TInt(4) and expect new element value to be 19.5', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.add(operand_3, operand_2).value).toBe(19.5);
        });

        test('subtract TFloat(15.5) and TInt(4) and expect new element value to be 11.5', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            operand_3.subtract(operand_2);
            expect(operand_3.value).toBe(11.5);
        });

        test('subtract TFloat(15.5) and TInt(4) and expect new element value to be 11.5', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.subtract(operand_3, operand_2).value).toBe(11.5);
        });

        test('multiply TFloat(15.5) and TInt(4) and expect new element value to be 62', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            operand_3.multiply(operand_2);
            expect(operand_3.value).toBe(62);
        });

        test('multiply TFloat(15.5) and TInt(4) and expect new element value to be 62', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.multiply(operand_3, operand_2).value).toBe(62);
        });

        test('divide TFloat(15.5) and TInt(4) and expect new element value to be 3.875', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            operand_3.divide(operand_2);
            expect(operand_3.value).toBe(3.875);
        });

        test('divide TFloat(15.5) and TInt(4) and expect new element value to be 3.875', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.divide(operand_3, operand_2).value).toBe(3.875);
        });

        test('mod TFloat(15.5) and TInt(4) and expect new element value to be 3.5', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            operand_3.mod(operand_2);
            expect(operand_3.value).toBe(3.5);
        });

        test('mod TFloat(15.5) and TInt(4) and expect new element value to be 3.5', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.mod(operand_3, operand_2).value).toBe(3.5);
        });

        test('check for equality of TFloat(15.5) and TInt(4) and expect to get false', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.equals(operand_3, operand_2).value).toBe(false);
        });

        test('check for equality of TFloat(15.5) and TFloat(15.5) and expect to get true', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TFloat(15.5);
            expect(TFloat.equals(operand_3, operand_2).value).toBe(true);
        });

        test('check if TFloat(15.5) greaterThan TInt(4) and expect to get true', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.greaterThan(operand_3, operand_2).value).toBe(true);
        });

        test('check if TFloat(15.5) lessThan TInt(4) and expect to get false', () => {
            const operand_3 = new TFloat(15.5);
            const operand_2 = new TInt(4);
            expect(TFloat.lessThan(operand_3, operand_2).value).toBe(false);
        });

        test('increment a TFloat(15.5) object and expect value to be 16.5', () => {
            const operand_3 = new TFloat(15.5);
            operand_3.increment();
            expect(operand_3.value).toBe(16.5);
        });

        test('decrement a TFloat(16.5) object and expect value to be 15.5', () => {
            const operand_1 = new TFloat(15.5);
            operand_1.decrement();
            expect(operand_1.value).toBe(14.5);
        });
    });

    describe('class TChar', () => {
        test('assign 65 and add offset of -500 to TChar to equal ASCII 0 character', () => {
            const typeObj = new TChar(65);
            typeObj.addOffset(-500);
            expect(typeObj.value).toBe(String.fromCharCode(0));
        });
    });

    const operand_4 = new TBoolean(true);
    const operand_5 = new TBoolean(false);

    describe('class TBoolean', () => {
        test('and TBoolean(true) and TBoolean(true) and expect new element value to be true', () => {
            expect(TBoolean.and(operand_4, operand_4).value).toBe(true);
        });

        test('and TBoolean(true) and TBoolean(false) and expect new element value to be false', () => {
            expect(TBoolean.and(operand_4, operand_5).value).toBe(false);
        });

        test('and TBoolean(false) and TBoolean(false) and expect new element value to be false', () => {
            expect(TBoolean.and(operand_5, operand_5).value).toBe(false);
        });

        test('or TBoolean(true) and TBoolean(true) and expect new element value to be true', () => {
            expect(TBoolean.or(operand_4, operand_4).value).toBe(true);
        });

        test('or TBoolean(true) and TBoolean(false) and expect new element value to be true', () => {
            expect(TBoolean.or(operand_4, operand_5).value).toBe(true);
        });

        test('or TBoolean(false) and TBoolean(false) and expect new element value to be false', () => {
            expect(TBoolean.or(operand_5, operand_5).value).toBe(false);
        });

        test('invert a TBoolean(true) and expect value to be false', () => {
            operand_4.invert();
            expect(operand_4.value).toBe(false);
        });

        test('invert a TBoolean(false) and expect value to be true', () => {
            operand_5.invert();
            expect(operand_5.value).toBe(true);
        });
    });
});
