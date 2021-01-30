import SyntaxHandler from './syntaxHandler';
import { SyntaxElement } from '../syntax-core/structureElements';

describe('related to Syntax Elements organization', () => {
    const synHandler = new SyntaxHandler();

    type TElemProps = {
        elementName: string;
        element: SyntaxElement;
        type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
    } | null;

    let startElemID: string;
    let startElemProps: TElemProps;
    let printElemID: string;
    let printElemProps: TElemProps;
    let addElemID: string;
    let addElemProps: TElemProps;

    describe('element creation', () => {
        test('create a block element and verify props', () => {
            startElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'start'
                }
            });
            startElemProps = synHandler.getElement(startElemID);
            expect(startElemProps).not.toBe(null);
            if (startElemProps !== null) {
                expect(startElemProps.elementName).toBe('start');
                expect(startElemProps.type).toBe('block');
                expect(startElemProps.element.elementName).toBe('start');
            } else {
                throw Error('Object should not be null');
            }
        });

        test('create a statement element and verify props', () => {
            printElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'print'
                }
            });
            printElemProps = synHandler.getElement(printElemID);
            expect(printElemProps).not.toBe(null);
            if (printElemProps !== null) {
                expect(printElemProps.elementName).toBe('print');
                expect(printElemProps.type).toBe('statement');
                expect(printElemProps.element.elementName).toBe('print');
            } else {
                throw Error('Object should not be null');
            }
        });

        test('create an argument expression element and verify props', () => {
            addElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'add'
                }
            });
            addElemProps = synHandler.getElement(addElemID);
            expect(addElemProps).not.toBe(null);
            if (addElemProps !== null) {
                expect(addElemProps.elementName).toBe('add');
                expect(addElemProps.type).toBe('arg-exp');
                expect(addElemProps.element.elementName).toBe('add');
            } else {
                throw Error('Object should not be null');
            }
        });
    });

    describe('element removal', () => {
        test('remove a previously created element and expect element properties fetch with its ID to be null', () => {
            synHandler.processQuery({
                action: 'remove',
                props: {
                    elementID: startElemID
                }
            });
            startElemProps = synHandler.getElement(startElemID);
            expect(startElemProps).toBe(null);
        });

        test('attempt ro remove an element with an invalid ID and expect error', () => {
            expect(() => {
                synHandler.processQuery({
                    action: 'remove',
                    props: {
                        elementID: 'abcdef'
                    }
                });
            }).toThrowError('Invalid argument: element with ID "abcdef" does not exist.');
        });
    });
});
