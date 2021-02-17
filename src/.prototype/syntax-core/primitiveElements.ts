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
    // -- All static methods must return a TInt, non-static directly update value so return void

    add(operand: TInt) {
        this.value += operand.value;
    }

    /** Binary + operator. */
    static add(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value + operand_2.value);
    }

    subtract(operand: TInt) {
        this.value -= operand.value;
    }

    /** Binary - operator. */
    static subtract(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value - operand_2.value);
    }

    multiply(operand: TInt) {
        this.value *= operand.value;
    }

    /** Binary * operator. */
    static multiply(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value * operand_2.value);
    }

    divide(operand: TInt) {
        this.value /= operand.value;
    }

    /** Binary / operator. */
    static divide(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value / operand_2.value);
    }

    mod(operand: TInt) {
        this.value %= operand.value;
    }

    /** Binary % operator. */
    static mod(operand_1: TInt, operand_2: TInt) {
        return new TInt(operand_1.value % operand_2.value);
    }

    /** Binary == operator. */
    static equals(operand_1: TInt, operand_2: TInt) {
        return new TBoolean(operand_1.value == operand_2.value);
    }

    /** Binary > operator. */
    static greaterThan(operand_1: TInt, operand_2: TInt) {
        return new TBoolean(operand_1.value > operand_2.value);
    }

    /** Binary < operator. */
    static lessThan(operand_1: TInt, operand_2: TInt) {
        return new TBoolean(operand_1.value < operand_2.value);
    }

    /** Unary ++ operator. */
    increment() {
        this._value++;
    }

    /** Unary -- operator. */
    decrement() {
        this._value--;
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
    // -- All static methods must return a TFloat, non-static directly update value so return void

    add(operand: TInt | TFloat) {
        this.value += operand.value;
    }

    /** Binary + operator. */
    static add(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value + operand_2.value);
    }

    subtract(operand: TInt | TFloat) {
        this.value -= operand.value;
    }

    /** Binary - operator. */
    static subtract(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value - operand_2.value);
    }

    multiply(operand: TInt | TFloat) {
        this.value *= operand.value;
    }

    /** Binary * operator. */
    static multiply(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value * operand_2.value);
    }

    divide(operand: TInt | TFloat) {
        this.value /= operand.value;
    }

    /** Binary / operator. */
    static divide(operand_1: TFloat | TInt, operand_2: TFloat | TInt) {
        return new TFloat(operand_1.value / operand_2.value);
    }

    mod(operand: TInt | TFloat) {
        this.value %= operand.value;
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

    /** Unary ++ operator. */
    increment() {
        this._value++;
    }

    /** Unary -- operator. */
    decrement() {
        this._value--;
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
    // -- All static methods must return a TChar, non-static directly update value so return void

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


    length(): TInt {
        return new TInt(this.value.length);
}

    charAt(index: TInt): TChar {
        const thisStr = this.value;
        const indxInt = index.value;
        if (indxInt < 0 || indxInt >= thisStr.length) {
            throw Error(`String index "${indxInt}" out of bounds`);
        }
        return new TChar(thisStr.charAt(indxInt));
    };

    indexOf(substring: TChar | TString): TInt {
        const thisStr = this.value;
        return new TInt(thisStr.indexOf(substring.value.toString()));
    };

    substring(startIndex: TInt, length?: TInt): TString {
        const thisStr = this.value;
        const indxInt = startIndex.value;
        if (typeof length === "undefined"){
            if (indxInt < 0 || indxInt >= thisStr.length) {
            throw Error(`String index "${indxInt}" out of bounds`);
        }
        return new TString(thisStr.substring(indxInt));
        }
        else {
            const endInt = length.value;
            if (indxInt < 0 || endInt >= thisStr.length){
                throw Error(`String index "${endInt}" out of bounds or "${indxInt} is less than 0"`);
            }
                return new TString(thisStr.substring(indxInt, endInt));
            }
    };

    equals(operand: TChar | TString): TBoolean{
        const thisStr = this.value;
        return new TBoolean(thisStr === operand.value.toString());
    };

    static equals(operand_1: TChar | TString, operand_2: TChar | TString): TBoolean{
        const operand1 = operand_1.value.toString();
        const operand2 = operand_2.value.toString();
        return new TBoolean(operand1 === operand2);
    };

    compareTo(operand: TChar | TString): TInt{
        return new TInt(this.value.length - operand.value.length);
    };

    static compare(operand_1: TChar | TString, operand_2: TChar | TString): TInt{
        const operand1 = operand_1.value.toString();
        const operand2 = operand_2.value.toString();
        return new TInt(operand1.length - operand2.length);
    };
}

/**
 * Boolean primitive type.
 * @todo add remaining operators.
 */
export class TBoolean extends PrimitiveElement<boolean> {
    constructor(value: boolean) {
        super('TBoolean', value);
    }

    // -- Operators ------------------------------------------------------------
    // -- All static methods must return a TBoolean, non-static directly update value so return void

    /** Binary && operator. */
    static and(operand_1: TBoolean, operand_2: TBoolean) {
        return new TBoolean(operand_1.value && operand_2.value);
    }

    /** Binary || operator. */
    static or(operand_1: TBoolean, operand_2: TBoolean) {
        return new TBoolean(operand_1.value || operand_2.value);
    }

    /** Unary ! operator. */
    invert() {
        this._value = !this._value;
    }
}
