import { OperationElement } from './operationElements';
import { ArgumentExpressionElement } from '../structureElements';
import { ValueElement } from './valueElements';

describe('arithmetic operations', () => {
    let operElem: ArgumentExpressionElement;

    test('supply two valid ArgumentElements to AddExpressionElement and verify', () => {
        operElem = new OperationElement.AddExpressionElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(19.5);
    });

    test('supply one valid ArgumentElement and a null to AddExpressionElement and verify', () => {
        operElem = new OperationElement.AddExpressionElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: null
        });
        expect(() => operElem.data).toThrowError('Invalid argument: "operand_2" cannot be null');
    });

    test('supply two valid ArgumentElements to SubtractExpressionElement and verify', () => {
        operElem = new OperationElement.SubtractExpressionElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(11.5);
    });

    test('supply two valid ArgumentElements to MultiplyExpressionElement and verify', () => {
        operElem = new OperationElement.MultiplyExpressionElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(62);
    });

    test('supply two valid ArgumentElements to DivideExpressionElement and verify', () => {
        operElem = new OperationElement.DivideExpressionElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(3.875);
    });

    test('supply two valid ArgumentElements to ModExpressionElement and verify', () => {
        operElem = new OperationElement.ModExpressionElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(3.5);
    });
});
