import SyntaxHandler from './syntaxHandler';
import {
    ArgumentDataElement,
    ArgumentElement,
    ArgumentExpressionElement,
    BlockElement,
    InstructionElement,
    StatementElement
} from '../syntax-core/structureElements';
import { ValueElement } from '../syntax-core/program-elements/valueElements';
import { DataElement } from '../syntax-core/program-elements/dataElements';
import { StartBlock } from '../syntax-core/AST';

describe("related to SyntaxElement objects' organization", () => {
    const synHandler = new SyntaxHandler();

    type TElemProps = {
        elementName: string;
        element: BlockElement | StatementElement | ArgumentDataElement | ArgumentExpressionElement;
        type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
    };

    let repeatElemID: string;
    let repeatElemProps: TElemProps;
    let printElemID: string;
    let printElemProps: TElemProps;
    let addElemID: string;
    let addElemProps: TElemProps;
    let intElemID: string;
    let intElemProps: TElemProps;
    let floatElemID: string;
    let floatElemProps: TElemProps;
    let intDataElemID: string;
    let intDataElemProps: TElemProps;
    let startElemID: string;
    let startElemProps: TElemProps;

    describe('element creation', () => {
        test('create a (non-start) block element and verify props', () => {
            repeatElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'repeat'
                }
            });
            repeatElemProps = synHandler.getElement(repeatElemID);
            expect(repeatElemProps.elementName).toBe('repeat');
            expect(repeatElemProps.type).toBe('block');
            expect(repeatElemProps.element.elementName).toBe('repeat');
        });

        test('create a statement element and verify props', () => {
            printElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'print'
                }
            });
            printElemProps = synHandler.getElement(printElemID);
            expect(printElemProps.elementName).toBe('print');
            expect(printElemProps.type).toBe('statement');
            expect(printElemProps.element.elementName).toBe('print');
        });

        test('create an argument expression element and verify props', () => {
            addElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'add'
                }
            });
            addElemProps = synHandler.getElement(addElemID);
            expect(addElemProps.elementName).toBe('add');
            expect(addElemProps.type).toBe('arg-exp');
            expect(addElemProps.element.elementName).toBe('add');
        });

        test('create an argument data element and verify props', () => {
            intElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'int',
                    arg: 5
                }
            });
            intElemProps = synHandler.getElement(intElemID);
            expect(intElemProps.elementName).toBe('int');
            expect(intElemProps.type).toBe('arg-data');
            expect(intElemProps.element.elementName).toBe('int');
            expect((intElemProps.element as ArgumentElement).data.value).toBe(5);
        });

        test('create a start element and verify', () => {
            startElemID = synHandler.processQuery({
                action: 'create',
                props: {
                    elementName: 'start'
                }
            });
            startElemProps = synHandler.getElement(startElemID);
            expect(startElemProps.elementName).toBe('start');
            expect(startElemProps.type).toBe('block');
            expect(startElemProps.element.elementName).toBe('start');
            expect(startElemProps.element instanceof StartBlock).toBe(true);
            expect(
                synHandler.AST.startBlocks.indexOf(startElemProps.element as StartBlock)
            ).not.toBe(-1);
        });
    });

    describe('element attachment', () => {
        floatElemID = synHandler.processQuery({
            action: 'create',
            props: {
                elementName: 'float',
                arg: 3
            }
        });
        floatElemProps = synHandler.getElement(floatElemID);

        intDataElemID = synHandler.processQuery({
            action: 'create',
            props: {
                elementName: 'data-int'
            }
        });
        intDataElemProps = synHandler.getElement(intDataElemID);

        test('attach an InstructionElement after an InstructionElement and verify', () => {
            (printElemProps.element as InstructionElement).next = intDataElemProps.element as InstructionElement;
            const elem = (printElemProps.element as InstructionElement).next;
            expect(elem).not.toBe(null);
            if (elem !== null) {
                expect(elem.elementName).toBe('data-int');
                expect(elem instanceof DataElement.IntDataElement);
            } else {
                throw Error('Object cannot be null.');
            }
        });

        test('detach InstructionElement attached to another InstructionElement and verify', () => {
            (printElemProps.element as InstructionElement).next = null;
            expect((printElemProps.element as InstructionElement).next).toBe(null);
        });

        test('attach a valid ArgumentElement to an InstructionElement and verify', () => {
            (printElemProps.element as InstructionElement).args.setArg(
                'message',
                intElemProps.element as ArgumentElement
            );
            const element = (printElemProps.element as InstructionElement).args.getArg('message');
            expect(element).not.toBe(null);
            if (element !== null) {
                expect(element.type).toBe('TInt');
                expect(element.elementName).toBe('int');
                expect(element.data.value).toBe(5);
            } else {
                throw Error('Object cannot not be null.');
            }
        });

        test('attach a valid ArgumentElement to an ArgumentExpressionElement and verify', () => {
            (addElemProps.element as ArgumentExpressionElement).args.setArg(
                'operand_1',
                floatElemProps.element as ArgumentElement
            );
            const element = (addElemProps.element as ArgumentExpressionElement).args.getArg(
                'operand_1'
            );
            expect(element).not.toBe(null);
            if (element !== null) {
                expect(element.type).toBe('TFloat');
                expect(element.elementName).toBe('float');
                expect(element.data.value).toBe(3);
            } else {
                throw Error('Object cannot not be null.');
            }
        });
    });

    describe('element removal', () => {
        test('remove a previously created element and expect element properties fetch to throw error', () => {
            synHandler.processQuery({
                action: 'remove',
                props: {
                    elementID: repeatElemID
                }
            });
            expect(() => synHandler.getElement(repeatElemID)).toThrowError(
                `Invalid argument: element with ID ${repeatElemID} does not exist.`
            );
        });

        test("remove a previously created 'start' element and expect element properties fetch to throw error", () => {
            const startElem = synHandler.getElement(startElemID).element;
            expect(startElem instanceof StartBlock).toBe(true);
            synHandler.processQuery({
                action: 'remove',
                props: {
                    elementID: startElemID
                }
            });
            expect(() => synHandler.getElement(startElemID)).toThrowError(
                `Invalid argument: element with ID ${startElemID} does not exist.`
            );
            expect(synHandler.AST.startBlocks.indexOf(startElem as StartBlock)).toBe(-1);
        });

        test('attempt to remove an element with an invalid ID and expect error', () => {
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
