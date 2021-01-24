import { OperationElement } from './operationElements';
import { ValueElement } from './valueElements';

describe('arithmetic operations', () => {
    test('supply two valid ArgumentElements to AddElement and verify', () => {
        const operElem = new OperationElement.AddElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(19.5);
    });

    test('supply one valid ArgumentElement and type-castable ArgumentElement to AddElement and verify', () => {
        const operElem = new OperationElement.AddElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.IntElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(19.5);
    });

    test('supply one valid ArgumentElement and a null to AddElement and verify', () => {
        const operElem = new OperationElement.AddElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = null;
        expect(() => operElem.data).toThrowError('Invalid argument: "operand_2" cannot be null');
    });

    test('supply two valid ArgumentElements to SubtractElement and verify', () => {
        const operElem = new OperationElement.SubtractElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(11.5);
    });

    test('supply two valid ArgumentElements to MultiplyElement and verify', () => {
        const operElem = new OperationElement.MultiplyElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(62);
    });

    test('supply two valid ArgumentElements to DivideElement and verify', () => {
        const operElem = new OperationElement.DivideElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(3.875);
    });

    test('supply two valid ArgumentElements to ModElement and verify', () => {
        const operElem = new OperationElement.ModElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TFloat');
        expect(resElem.value).toBe(3.5);
    });
});

describe('relation operations', () => {
    test('supply two valid ArgumentElements to EqualsElement and verify', () => {
        const operElem = new OperationElement.EqualsElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(15.5);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply one valid ArgumentElement and type-castable ArgumentElement to EqualsElement and verify', () => {
        const operElem = new OperationElement.EqualsElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.0);
        operElem.operand_2 = new ValueElement.IntElement(15);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply one valid ArgumentElement and a null to EqualsElement and verify', () => {
        const operElem = new OperationElement.EqualsElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = null;
        expect(() => operElem.data).toThrowError('Invalid argument: "operand_2" cannot be null');
    });

    test('supply two valid ArgumentElements to GreaterThanElement and verify', () => {
        const operElem = new OperationElement.GreaterThanElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply two valid ArgumentElements to LessThanElement and verify', () => {
        const operElem = new OperationElement.LessThanElement();
        operElem.operand_1 = new ValueElement.FloatElement(15.5);
        operElem.operand_2 = new ValueElement.FloatElement(4);
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(false);
    });
});

describe('boolean operations', () => {
    test('supply two valid ArgumentElements to AndElement and verify', () => {
        const operElem = new OperationElement.AndElement();
        operElem.operand_1 = new ValueElement.TrueElement();
        operElem.operand_2 = new ValueElement.TrueElement();
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });

    test('supply one valid ArgumentElement and a null to EqualsElement and verify', () => {
        const operElem = new OperationElement.AndElement();
        operElem.operand_1 = new ValueElement.TrueElement();
        operElem.operand_2 = null;
        expect(() => operElem.data).toThrowError('Invalid argument: "operand_2" cannot be null');
    });

    test('supply two valid ArgumentElements to OrElement and verify', () => {
        const operElem = new OperationElement.OrElement();
        operElem.operand_1 = new ValueElement.TrueElement();
        operElem.operand_2 = new ValueElement.FalseElement();
        const resElem = operElem.data;
        expect(resElem.type).toBe('TBoolean');
        expect(resElem.value).toBe(true);
    });
});
