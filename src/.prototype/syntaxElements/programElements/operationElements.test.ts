import { OperationElement } from './operationElements';
import { ArgumentExpressionElement } from '../structureElements';
import { ValueElement } from './valueElements';

describe('arithmetic operations', () => {
    let operElem: ArgumentExpressionElement;

    test('supply two valid ArgumentElements to AddElement and verify', () => {
        operElem = new OperationElement.AddElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(19.5);
    });

    test('supply one valid ArgumentElement and type-castable ArgumentElement to AddElement and verify', () => {
        operElem = new OperationElement.AddElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.IntElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(19.5);
    });

    test('supply one valid ArgumentElement and a null to AddElement and verify', () => {
        operElem = new OperationElement.AddElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: null
        });
        expect(() => operElem.data).toThrowError('Invalid argument: "operand_2" cannot be null');
    });

    test('supply two valid ArgumentElements to SubtractElement and verify', () => {
        operElem = new OperationElement.SubtractElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(11.5);
    });

    test('supply two valid ArgumentElements to MultiplyElement and verify', () => {
        operElem = new OperationElement.MultiplyElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(62);
    });

    test('supply two valid ArgumentElements to DivideElement and verify', () => {
        operElem = new OperationElement.DivideElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(3.875);
    });

    test('supply two valid ArgumentElements to ModElement and verify', () => {
        operElem = new OperationElement.ModElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(4)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(3.5);
    });
});

describe('relation operations', () => {
    let operElem: ArgumentExpressionElement;

    test('supply two valid ArgumentElements to EqualsElement and verify', () => {
        operElem = new OperationElement.EqualsElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(15.5)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply one valid ArgumentElement and type-castable ArgumentElement to EqualsElement and verify', () => {
        operElem = new OperationElement.EqualsElement({
            operand_1: new ValueElement.FloatElement(15.0),
            operand_2: new ValueElement.IntElement(15)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply one valid ArgumentElement and a null to EqualsElement and verify', () => {
        operElem = new OperationElement.EqualsElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: null
        });
        expect(() => operElem.data).toThrowError('Invalid argument: "operand_2" cannot be null');
    });

    test('supply two valid ArgumentElements to GreaterThanElement and verify', () => {
        operElem = new OperationElement.GreaterThanElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(11)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply two valid ArgumentElements to LessThanElement and verify', () => {
        operElem = new OperationElement.LessThanElement({
            operand_1: new ValueElement.FloatElement(15.5),
            operand_2: new ValueElement.FloatElement(11)
        });
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(false);
    });
});
