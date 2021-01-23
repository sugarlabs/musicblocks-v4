import { TPrimitiveName } from './@types/primitiveTypes';
import { IPrimitiveElement } from './@types/primitiveElements';

/**
 * @private
 * A generic Primitive Element based on JavaScript types (number, string, boolean). The aim is to
 * wrap these types to produce integer, float, character, string, boolean. Sub-classes of this shall
 * be the Primitive types as far as the Music Blocks framework is concerned. The implementation of
 * operations on types, however, can't be implemented trivially since JavaScript doesn't support
 * operator overloading. Therefore, it is done using class methods. Not the best, but we have to
 * live with that if we need the custom primitive types.
 */
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

// ---- Primitive Type Classes ---------------------------------------------------------------------

/**
 * Integer primitive type.
 * @todo add remaining operators.
 */
export class TInt extends PrimitiveElement<number> {
    constructor(value: number) {
        super('TInt', value);
        this.value = value;
    }

    /**
     * @override
     * Setter for wrapped value.
     */
    set value(value: number) {
        this._value = TInt.toInt(value);
    }

    /**
     * @override
     * Getter for wrapped value.
     */
    get value() {
        return this._value;
    }

    // -- Utilities ------------------------------------------------------------

    /** Trims decimal portion of a floating number. */
    static toInt(value: number) {
        return Math.floor(value);
    }

    /**
     * Type casts other primitives types to TInt.
     * @throws Invalid format
     */
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

    // -- Operators ------------------------------------------------------------

    /** Binary + operator. */
    static add(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value + operand_2.value);
    }

    /** Binary - operator. */
    static subtract(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value - operand_2.value);
    }

    /** Binary * operator. */
    static multiply(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value * operand_2.value);
    }

    /** Binary / operator. */
    static divide(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value / operand_2.value);
    }

    /** Binary % operator. */
    static mod(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value % operand_2.value);
    }
}

/**
 * Float primitive type.
 * @todo add remaining operators.
 */
export class TFloat extends PrimitiveElement<number> {
    constructor(value: number) {
        super('TFloat', value);
    }

    // -- Utilities ------------------------------------------------------------

    /**
     * Type casts other primitives types to TFloat.
     * @throws Invalid format
     */
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

    // -- Operators ------------------------------------------------------------

    /** Binary + operator. */
    static add(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value + operand_2.value);
    }

    /** Binary - operator. */
    static subtract(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value - operand_2.value);
    }

    /** Binary * operator. */
    static multiply(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value * operand_2.value);
    }

    /** Binary / operator. */
    static divide(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value / operand_2.value);
    }

    /** Binary % operator. */
    static mod(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value % operand_2.value);
    }

    /** Binary == operator. */
    static equals(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TBoolean(operand_1.value == operand_2.value);
    }

    /** Binary > operator. */
    static greaterThan(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TBoolean(operand_1.value > operand_2.value);
    }

    /** Binary < operator. */
    static lessThan(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TBoolean(operand_1.value < operand_2.value);
    }
}

/**
 * Character primitive type.
 * @todo add remaining operators.
 */
export class TChar extends PrimitiveElement<string> {
    constructor(value: string | number) {
        super('TChar', '');
        if (typeof value === 'string') {
            this.value = value;
        } else {
            this.valueInt = value;
        }
    }

    /**
     * @override
     * Setter for wrapped value.
     */
    set value(value: string) {
        this._value = value.length === 0 ? String.fromCharCode(0) : value.charAt(0);
    }

    /**
     * @override
     * Getter for wrapped value.
     */
    get value() {
        return this._value;
    }

    /** Setter for wrapped value (by ASCII). */
    set valueInt(value: number) {
        this._value = TChar.toChar(value);
    }

    // -- Utilities ------------------------------------------------------------

    /** Returns equivalent character for ASCII (trimmed to [0, 255]). */
    static toChar(value: number) {
        return String.fromCharCode(Math.min(Math.max(TInt.toInt(value), 0), 255));
    }

    /** Type casts TInt or TChar types to TChar. */
    static TChar(primitive: TChar | TInt) {
        if (primitive instanceof TInt) {
            return new TChar(TChar.toChar(primitive.value));
        } else {
            return primitive;
        }
    }

    // -- Operators ------------------------------------------------------------

    /** Unary add ASCII operator. */
    addOffset(offset: number) {
        this._value = TChar.toChar(this._value.toString().charCodeAt(0) + TInt.toInt(offset));
    }
}

/**
 * String primitive type.
 * @todo add remaining operators.
 */
export class TString extends PrimitiveElement<string> {
    constructor(value: string) {
        super('TString', value);
    }

    // -- Utilities ------------------------------------------------------------

    /** Type casts other primitive types to TString. */
    static TString(primitive: TString | TInt | TFloat | TChar) {
        if (primitive instanceof TString) {
            return primitive;
        } else {
            return new TString(primitive.value.toString());
        }
    }
}

/**
 * Boolean primitive type.
 * @todo add remaining operators.
 */
export class TBoolean extends PrimitiveElement<boolean> {
    constructor(value: boolean) {
        super('TBoolean', value);
    }
}
