import { TInt, TFloat, TChar, TString, TBoolean } from './primitiveElements';
import { ArgumentDataElement } from './structureElements';

/**
 * @abstract All ValueElements are ArgumentDataElements.
 */
export namespace ValueElement {
    /** ArgumentDataElement wrapper for primitive TInt type. */
    export class IntElement extends ArgumentDataElement {
        constructor(value: number) {
            super('int', new TInt(value));
        }
    }

    /** ArgumentDataElement wrapper for primitive TFloat type. */
    export class FloatElement extends ArgumentDataElement {
        constructor(value: number) {
            super('float', new TFloat(value));
        }
    }

    /** ArgumentDataElement wrapper for primitive TChar type. */
    export class CharElement extends ArgumentDataElement {
        constructor(value: string | number) {
            super('char', new TChar(value));
        }
    }

    /** ArgumentDataElement wrapper for primitive TString type. */
    export class StringElement extends ArgumentDataElement {
        constructor(value: string) {
            super('string', new TString(value));
        }
    }

    /** ArgumentDataElement wrapper for primitive TBoolean(true) type. */
    export class TrueElement extends ArgumentDataElement {
        constructor() {
            super('true', new TBoolean(true));
        }
    }

    /** ArgumentDataElement wrapper for primitive TBoolean(false) type. */
    export class FalseElement extends ArgumentDataElement {
        constructor() {
            super('false', new TBoolean(false));
        }
    }
}
