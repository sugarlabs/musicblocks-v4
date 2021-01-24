import { TPrimitive } from '../@types/primitiveTypes';
import { TInt, TFloat, TChar, TString, TBoolean } from '../primitiveElements';
import { ArgumentDataElement } from '../structureElements';
import { DataElement } from './dataElements';

type dataElemType =
    | DataElement.IntDataElement
    | DataElement.FloatDataElement
    | DataElement.CharDataElement
    | DataElement.StringDataElement
    | DataElement.BooleanDataElement
    | DataElement.AnyDataElement;

/**
 * @abstract All ValueElements are ArgumentDataElements.
 */
export namespace ValueElement {
    abstract class ValueElement extends ArgumentDataElement {
        private _dataElem: dataElemType | null = null;

        constructor(elementName: string, data: TPrimitive) {
            super(elementName, data);
        }

        set dataElement(dataElement: dataElemType | null) {
            this._dataElem = dataElement;
        }

        get dataElement() {
            return this._dataElem;
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

    /** ArgumentDataElement wrapper for primitive TFloat type. */
    export class FloatElement extends ValueElement {
        constructor(value: number) {
            super('float', new TFloat(value));
        }

        update(value: number) {
            this.data.value = value;
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

    /** ArgumentDataElement wrapper for primitive TString type. */
    export class StringElement extends ValueElement {
        constructor(value: string) {
            super('string', new TString(value));
        }

        update(value: string) {
            this.data.value = value;
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
}
