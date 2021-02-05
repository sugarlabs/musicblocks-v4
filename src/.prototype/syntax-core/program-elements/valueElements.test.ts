import { ValueElement } from './valueElements';

describe('namespace ValueElement', () => {
    let intValElem: ValueElement.IntElement;
    let floatValElem: ValueElement.FloatElement;
    let charValElem: ValueElement.CharElement;
    let stringValElem: ValueElement.StringElement;

    describe('instantiation and value verification', () => {
        test('instantiate a IntElement with 5 and expect 5 to be data', () => {
            intValElem = new ValueElement.IntElement(5);
            expect(intValElem.getData().value).toBe(5);
        });
        test('instantiate a FloatElement with 2.71828 and expect 2.71828 to be data', () => {
            floatValElem = new ValueElement.FloatElement(2.71828);
            expect(floatValElem.getData().value).toBe(2.71828);
        });
        test('instantiate a CharElement with 97 and expect "a" to be data', () => {
            charValElem = new ValueElement.CharElement(97);
            expect(charValElem.getData().value).toBe('a');
        });
        test('instantiate a StringElement with "string" and expect "string" to be data', () => {
            stringValElem = new ValueElement.StringElement('string');
            expect(stringValElem.getData().value).toBe('string');
        });
        test('instantiate a TrueElement and expect true to be data', () => {
            expect(new ValueElement.TrueElement().getData().value).toBe(true);
        });
        test('instantiate a FalseElement and expect false to be data', () => {
            expect(new ValueElement.FalseElement().getData().value).toBe(false);
        });
    });

    describe('value updation', () => {
        test('update IntElement value to 2 and expect 2 to be data', () => {
            intValElem.update(2);
            expect(intValElem.getData().value).toBe(2);
        });

        test('update FloatElement value to 3.1415 and expect 3.1415 to be data', () => {
            floatValElem.update(3.1415);
            expect(floatValElem.getData().value).toBe(3.1415);
        });

        test('update CharElement value to "x" and expect "x" to be data', () => {
            charValElem.update('x');
            expect(charValElem.getData().value).toBe('x');
        });

        test('update StringElement value to "another" and expect "another" to be data', () => {
            stringValElem.update('another');
            expect(stringValElem.getData().value).toBe('another');
        });
    });
});
