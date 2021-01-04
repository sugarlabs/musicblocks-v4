import { IValueElement } from './@types/syntaxElems';

class ValueElement<T> implements IValueElement<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    update(value: T) {
        this._value = value;
    }
}

export class TInt extends ValueElement<number> {
    constructor(value: number) {
        super(Math.floor(value));
    }
}

export class TFloat extends ValueElement<number> {
    constructor(value: number) {
        super(value);
    }
}

export class TChar extends ValueElement<string> {
    constructor(value: string | number) {
        super(
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

export class TString extends ValueElement<string> {
    constructor(value: string) {
        super(value);
    }
}

export class TBoolean extends ValueElement<boolean> {
    constructor(value: boolean) {
        super(value);
    }
}
