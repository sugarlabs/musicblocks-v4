import { createSyntaxElement } from './syntaxElementFactory';
import { ValueElement } from './program-elements/valueElements';

describe('createSyntaxElement utililty', () => {
    test("instantiate an element that doesn't take arguments and verify object and type", () => {
        const elem = createSyntaxElement('start');
        expect(elem.element.elementName).toBe('start');
        expect(elem.type).toBe('block');
    });

    test('instantiate (with valid arguments) an element that takes arguments and verify object and type', () => {
        const elem = createSyntaxElement('int', 5);
        expect(elem.element.elementName).toBe('int');
        expect(elem.type).toBe('arg-data');
        expect((elem.element as ValueElement.IntElement).getData().value).toBe(5);
    });

    test('attempt to instantiate (with invalid arguments) an element that takes arguments and expect error', () => {
        expect(() => {
            const elem = createSyntaxElement('int', 'string');
            const v = (elem.element as ValueElement.IntElement).getData();
            expect(v.value).toBe('string');
        }).toThrowError('Instantiation failed: invalid argument supplied for element "int".');
    });

    test('attempt to instantiate (without arguments) an element that takes arguments and expect error', () => {
        expect(() => createSyntaxElement('int')).toThrowError(
            'Instantiation failed: invalid argument supplied for element "int".'
        );
    });
});
