import { IPrimitiveElement } from './@types/primitiveElements';
import { TPrimitiveName } from './@types/primitiveTypes';

class PrimitiveElement<T> implements IPrimitiveElement<T> {
    private _value: T;
    private _type: TPrimitiveName;

    constructor(type: TPrimitiveName, data: T) {
        this._type = type;
        this._value = data;
    }

    get type() {
        return this._type;
    }

    get value() {
        return this._value;
    }

    protected update(value: T) {
        this._value = value;
    }
}

export class TInt extends PrimitiveElement<number> {
    constructor(value: number) {
        super('TInt', Math.floor(value));
    }
}

export class TFloat extends PrimitiveElement<number> {
    constructor(value: number) {
        super('TFloat', value);
    }
}

export class TChar extends PrimitiveElement<string> {
    constructor(value: string | number) {
        super(
            'TChar',
            typeof value === 'string'
                ? value.length === 0
                    ? String.fromCharCode(0)
                    : value.charAt(0)
                : String.fromCharCode(Math.min(Math.max(value, 0), 255))
        );
    }

    addOffset(offset: number) {
        const asciiValue = this.value.charCodeAt(0);
        this.update(String.fromCharCode(Math.min(Math.max(asciiValue + offset, 0), 255)));
    }
}

export class TString extends PrimitiveElement<string> {
    constructor(value: string) {
        super('TString', value);
    }
}

export class TBoolean extends PrimitiveElement<boolean> {
    constructor(value: boolean) {
        super('TBoolean', value);
    }
}
