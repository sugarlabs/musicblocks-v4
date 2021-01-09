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
    const operand_1 = new TInt(15);
    const operand_2 = new TInt(4);

    describe('class TInt', () => {
        test('add TInt(15) and TInt(4) and expect new element value to be 19', () => {
            expect(TInt.add(operand_1, operand_2).value).toBe(19);
        });

        test('subtract TInt(15) and TInt(4) and expect new element value to be 11', () => {
            expect(TInt.subtract(operand_1, operand_2).value).toBe(11);
        });

        test('multiply TInt(15) and TInt(4) and expect new element value to be 60', () => {
            expect(TInt.multiply(operand_1, operand_2).value).toBe(60);
        });

        test('divide TInt(15) and TInt(4) and expect new element value to be 3', () => {
            expect(TInt.divide(operand_1, operand_2).value).toBe(3);
        });

        test('mod TInt(15) and TInt(4) and expect new element value to be 3', () => {
            expect(TInt.mod(operand_1, operand_2).value).toBe(3);
        });
    });

    const operand_3 = new TFloat(15.5);

    describe('class TFloat', () => {
        test('add TFloat(15.5) and TInt(4) and expect new element value to be 19.5', () => {
            expect(TFloat.add(operand_3, operand_2).value).toBe(19.5);
        });

        test('subtract TFloat(15.5) and TInt(4) and expect new element value to be 11.5', () => {
            expect(TFloat.subtract(operand_3, operand_2).value).toBe(11.5);
        });

        test('multiply TFloat(15.5) and TInt(4) and expect new element value to be 62', () => {
            expect(TFloat.multiply(operand_3, operand_2).value).toBe(62);
        });

        test('divide TFloat(15.5) and TInt(4) and expect new element value to be 3.875', () => {
            expect(TFloat.divide(operand_3, operand_2).value).toBe(3.875);
        });

        test('mod TFloat(15.5) and TInt(4) and expect new element value to be 3.5', () => {
            expect(TFloat.mod(operand_3, operand_2).value).toBe(3.5);
        });
    });

    describe('class TChar', () => {
        test('assign 65 and add offset of -500 to TChar to equal ASCII 0 character', () => {
            const typeObj = new TChar(65);
            typeObj.addOffset(-500);
            expect(typeObj.value).toBe(String.fromCharCode(0));
        });
    });
});
