import { StatementElement } from '../structureElements';
import { BoxElement } from './dataElements';
import { ValueElement } from './valueElements';

describe('namespace BoxElement', () => {
    let boxElem: StatementElement;

    test('inititalize IntBoxElement with IntElement object and verify', () => {
        boxElem = new BoxElement.IntBoxElement({
            identifier: new ValueElement.StringElement('myBox'),
            value: new ValueElement.IntElement(5)
        });
        const arg = boxElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe(5);
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize IntBoxElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            boxElem = new BoxElement.IntBoxElement({
                identifier: new ValueElement.StringElement('myBox'),
                value: new ValueElement.TrueElement()
            });
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize FloatBoxElement with FloatElement object and verify', () => {
        boxElem = new BoxElement.FloatBoxElement({
            identifier: new ValueElement.StringElement('myBox'),
            value: new ValueElement.FloatElement(5.234)
        });
        const arg = boxElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe(5.234);
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize FloatBoxElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            boxElem = new BoxElement.FloatBoxElement({
                identifier: new ValueElement.StringElement('myBox'),
                value: new ValueElement.TrueElement()
            });
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize CharBoxElement with CharElement object and verify', () => {
        boxElem = new BoxElement.CharBoxElement({
            identifier: new ValueElement.StringElement('myBox'),
            value: new ValueElement.CharElement(97)
        });
        const arg = boxElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe('a');
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize CharBoxElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            boxElem = new BoxElement.CharBoxElement({
                identifier: new ValueElement.StringElement('myBox'),
                value: new ValueElement.TrueElement()
            });
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize StringBoxElement with StringElement object and verify', () => {
        boxElem = new BoxElement.StringBoxElement({
            identifier: new ValueElement.StringElement('myBox'),
            value: new ValueElement.StringElement('string')
        });
        const arg = boxElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe('string');
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize StringBoxElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            boxElem = new BoxElement.StringBoxElement({
                identifier: new ValueElement.StringElement('myBox'),
                value: new ValueElement.TrueElement()
            });
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize BooleanBoxElement with BooleanElement object and verify', () => {
        boxElem = new BoxElement.BooleanBoxElement({
            identifier: new ValueElement.StringElement('myBox'),
            value: new ValueElement.TrueElement()
        });
        const arg = boxElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe(true);
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize BooleanBoxElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            boxElem = new BoxElement.BooleanBoxElement({
                identifier: new ValueElement.StringElement('myBox'),
                value: new ValueElement.IntElement(5)
            });
        }).toThrowError('Invalid argument: "TInt" is not a valid type for "value"');
    });

    test('inititalize AnyBoxElement with StringElement object and verify', () => {
        boxElem = new BoxElement.AnyBoxElement({
            identifier: new ValueElement.StringElement('myBox'),
            value: new ValueElement.StringElement('any')
        });
        const arg = boxElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe('any');
        } else {
            throw Error('Object should not be null');
        }
    });
});
