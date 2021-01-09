import { TPrimitiveName } from './@types/primitiveTypes';

interface IPrimitiveElement<T> {
    type: TPrimitiveName;
    value: T;
}

abstract class PrimitiveElement<T> implements IPrimitiveElement<T> {
    protected _value: T;
    private _type: TPrimitiveName;

    constructor(type: TPrimitiveName, value: T) {
        this._type = type;
        this._value = value;
    }

    get type() {
        return this._type;
    }

    set value(value: T) {
        this._value = value;
    }

    get value() {
        return this._value;
    }
}

export class TInt extends PrimitiveElement<number> {
    static toInt(value: number) {
        return Math.floor(value);
    }

    /** @throws Invalid format */
    static TInt(primitive: TInt | TFloat | TChar | TString) {
        if (primitive instanceof TFloat) {
            return new TInt(primitive.value);
        } else if (primitive instanceof TChar) {
            return new TInt((primitive.value as string).charCodeAt(0));
        } else if (primitive instanceof TString) {
            const num = Number(primitive.value);
            if (isNaN(num)) {
                throw Error(`Invalid format: TString object does not represent a number`);
            }
            return new TInt(num);
        } else {
            return primitive;
        }
    }

    constructor(value: number) {
        super('TInt', value);
        this.value = value;
    }

    set value(value: number) {
        this._value = TInt.toInt(value);
    }

    get value() {
        return this._value;
    }

    static add(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value + operand_2.value);
    }

    static subtract(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value - operand_2.value);
    }

    static multiply(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value * operand_2.value);
    }

    static divide(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value / operand_2.value);
    }

    static mod(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value % operand_2.value);
    }
}

export class TFloat extends PrimitiveElement<number> {
    /** @throws Invalid format */
    static TFloat(primitive: TFloat | TInt | TString) {
        if (primitive instanceof TInt) {
            return new TFloat(primitive.value);
        } else if (primitive instanceof TString) {
            const num = Number(primitive.value);
            if (isNaN(num)) {
                throw Error(`Invalid format: TString object does not represent a number`);
            }
            return new TFloat(num);
        } else {
            return primitive;
        }
    }

    constructor(value: number) {
        super('TFloat', value);
    }

    static add(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value + operand_2.value);
    }

    static subtract(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value - operand_2.value);
    }

    static multiply(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value * operand_2.value);
    }

    static divide(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value / operand_2.value);
    }

    static mod(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value % operand_2.value);
    }
}

export class TChar extends PrimitiveElement<string | number> {
    static toChar(value: number) {
        return String.fromCharCode(Math.min(Math.max(TInt.toInt(value), 0), 255));
    }

    static TChar(primitive: TChar | TInt) {
        if (primitive instanceof TInt) {
            return new TChar(TChar.toChar(primitive.value));
        } else {
            return primitive;
        }
    }

    constructor(value: string | number) {
        super('TChar', value);
        this.value = value;
    }

    set value(value: string | number) {
        if (typeof value === 'number') {
            value = TChar.toChar(value);
        }
        this._value = value.length === 0 ? String.fromCharCode(0) : value.charAt(0);
    }

    get value() {
        return this._value;
    }

    addOffset(offset: number) {
        this._value = TChar.toChar(this._value.toString().charCodeAt(0) + TInt.toInt(offset));
    }
}

export class TString extends PrimitiveElement<string> {
    static TString(primitive: TString | TInt | TFloat | TChar) {
        if (primitive instanceof TString) {
            return primitive;
        } else {
            return new TString(primitive.value.toString());
        }
    }

    constructor(value: string) {
        super('TString', value);
    }
}

export class TBoolean extends PrimitiveElement<boolean> {
    constructor(value: boolean) {
        super('TBoolean', value);
    }
}
