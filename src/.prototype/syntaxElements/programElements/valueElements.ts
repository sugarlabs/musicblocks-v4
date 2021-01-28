import { TPrimitive } from '../@types/primitiveTypes';
import { TInt, TFloat, TChar, TString, TBoolean } from '../primitiveElements';
import { ArgumentDataElement } from '../structureElements';

/**
 * @abstract All ValueElements are ArgumentDataElements.
 */
export namespace ValueElement {
    abstract class ValueElement extends ArgumentDataElement {
        constructor(elementName: string, data: TPrimitive) {
            super(elementName, data);
        }
    }

    /** ArgumentDataElement wrapper for primitive TInt type. */
    export class IntElement extends ValueElement {
        constructor(value: number) {
            super('int', new TInt(value));
        }

        update(value: number) {
            this.data.value = value;
        }
    }

    /** Maybe merged into IntElement. */
    export class IntDataValueElement extends ValueElement {
        constructor(data: TInt) {
            super('data-value-int', data);
        }
    }

    /** ArgumentDataElement wrapper for primitive TFloat type. */
    export class FloatElement extends ValueElement {
        constructor(value: number) {
            super('float', new TFloat(value));
        }

        update(value: number) {
            this.data.value = value;
        }
    }

    /** Maybe merged into FloatElement. */
    export class FloatDataValueElement extends ValueElement {
        constructor(data: TFloat) {
            super('data-value-float', data);
        }
    }

    /** ArgumentDataElement wrapper for primitive TChar type. */
    export class CharElement extends ValueElement {
        constructor(value: string | number) {
            super('char', new TChar(value));
        }

        update(value: string | number) {
            this.data.value = value;
        }
    }

    /** Maybe merged into CharElement. */
    export class CharDataValueElement extends ValueElement {
        constructor(data: TChar) {
            super('data-value-char', data);
        }
    }

    /** ArgumentDataElement wrapper for primitive TString type. */
    export class StringElement extends ValueElement {
        constructor(value: string) {
            super('string', new TString(value));
        }

        update(value: string) {
            this.data.value = value;
        }
    }

    /** Maybe merged into StringElement. */
    export class StringDataValueElement extends ValueElement {
        constructor(data: TString) {
            super('data-value-string', data);
        }
    }

    /** ArgumentDataElement wrapper for primitive TBoolean(true) type. */
    export class TrueElement extends ValueElement {
        constructor() {
            super('true', new TBoolean(true));
        }
    }

    /** ArgumentDataElement wrapper for primitive TBoolean(false) type. */
    export class FalseElement extends ValueElement {
        constructor() {
            super('false', new TBoolean(false));
        }
    }

    export class BooleanDataValueElement extends ValueElement {
        constructor(data: TBoolean) {
            super('data-value-boolean', data);
        }
    }
}
