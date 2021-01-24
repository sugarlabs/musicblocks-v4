import { DataElement } from './dataElements';
import { ValueElement } from './valueElements';

describe('namespace DataElement', () => {
    test('inititalize IntDataElement with IntElement object and verify', () => {
        const dataElem = new DataElement.IntDataElement();
        dataElem.argIdentifier = new ValueElement.StringElement('myBox');
        dataElem.argValue = new ValueElement.IntElement(5);
        const arg = dataElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe(5);
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize IntDataElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            const dataElem = new DataElement.IntDataElement();
            dataElem.argIdentifier = new ValueElement.StringElement('myBox');
            dataElem.argValue = new ValueElement.TrueElement();
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize FloatDataElement with FloatElement object and verify', () => {
        const dataElem = new DataElement.FloatDataElement();
        dataElem.argIdentifier = new ValueElement.StringElement('myBox');
        dataElem.argValue = new ValueElement.FloatElement(5.234);
        const arg = dataElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe(5.234);
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize FloatDataElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            const dataElem = new DataElement.FloatDataElement();
            dataElem.argIdentifier = new ValueElement.StringElement('myBox');
            dataElem.argValue = new ValueElement.TrueElement();
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize CharDataElement with CharElement object and verify', () => {
        const dataElem = new DataElement.CharDataElement();
        dataElem.argIdentifier = new ValueElement.StringElement('myBox');
        dataElem.argValue = new ValueElement.CharElement(97);
        const arg = dataElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe('a');
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize CharDataElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            const dataElem = new DataElement.CharDataElement();
            dataElem.argIdentifier = new ValueElement.StringElement('myBox');
            dataElem.argValue = new ValueElement.TrueElement();
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize StringDataElement with StringElement object and verify', () => {
        const dataElem = new DataElement.StringDataElement();
        dataElem.argIdentifier = new ValueElement.StringElement('myBox');
        dataElem.argValue = new ValueElement.StringElement('string');
        const arg = dataElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe('string');
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize StringDataElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            const dataElem = new DataElement.StringDataElement();
            dataElem.argIdentifier = new ValueElement.StringElement('myBox');
            dataElem.argValue = new ValueElement.TrueElement();
        }).toThrowError('Invalid argument: "TBoolean" is not a valid type for "value"');
    });

    test('inititalize BooleanDataElement with BooleanElement object and verify', () => {
        const dataElem = new DataElement.BooleanDataElement();
        dataElem.argIdentifier = new ValueElement.StringElement('myBox');
        dataElem.argValue = new ValueElement.TrueElement();
        const arg = dataElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe(true);
        } else {
            throw Error('Object should not be null');
        }
    });

    test('initialize BooleanDataElement with ArgumentElement object of unaccepted return-type and expect error', () => {
        expect(() => {
            const dataElem = new DataElement.BooleanDataElement();
            dataElem.argIdentifier = new ValueElement.StringElement('myBox');
            dataElem.argValue = new ValueElement.IntElement(5);
        }).toThrowError('Invalid argument: "TInt" is not a valid type for "value"');
    });

    test('inititalize AnyDataElement with StringElement object and verify', () => {
        const dataElem = new DataElement.AnyDataElement();
        dataElem.argIdentifier = new ValueElement.StringElement('myBox');
        dataElem.argValue = new ValueElement.StringElement('any');
        const arg = dataElem.args.getArg('value');
        if (arg !== null) {
            expect(arg.data.value).toBe('any');
        } else {
            throw Error('Object should not be null');
        }
    });
});
