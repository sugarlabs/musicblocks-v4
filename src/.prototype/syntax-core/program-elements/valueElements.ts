import { TPrimitive } from '../@types/primitiveTypes';
import { TInt, TFloat, TChar, TString, TBoolean } from '../primitiveElements';
import { ArgumentDataElement } from '../structureElements';
import { DataElement } from './dataElements';

type dataElemType =
    | DataElement.IntDataElement
    | DataElement.FloatDataElement
    | DataElement.CharDataElement
    | DataElement.StringDataElement
    | DataElement.BooleanDataElement;
// | DataElement.AnyDataElement;

/**
 * @abstract All ValueElements are ArgumentDataElements.
 */
export namespace ValueElement {
    abstract class ValueElement extends ArgumentDataElement {
        private _data: TPrimitive;

        constructor(elementName: string, data: TPrimitive) {
            super(elementName, data.type, false);
            this._data = data;
        }

        /** @override */
        getData() {
            return this._data;
        }
    }

    /** ArgumentDataElement wrapper for primitive TInt type. */
    export class IntElement extends ValueElement {
        constructor(value: number) {
            super('int', new TInt(value));
        }

        update(value: number) {
            this.getData().value = value;
        }
    }

    /** ArgumentDataElement wrapper for primitive TFloat type. */
    export class FloatElement extends ValueElement {
        constructor(value: number) {
            super('float', new TFloat(value));
        }

        update(value: number) {
            this.getData().value = value;
        }
    }

    /** ArgumentDataElement wrapper for primitive TChar type. */
    export class CharElement extends ValueElement {
        constructor(value: string | number) {
            super('char', new TChar(value));
        }

        update(value: string | number) {
            this.getData().value = value;
        }
    }

    /** ArgumentDataElement wrapper for primitive TString type. */
    export class StringElement extends ValueElement {
        constructor(value: string) {
            super('string', new TString(value));
        }

        update(value: string) {
            this.getData().value = value;
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

    abstract class DataValueElement extends ArgumentDataElement {
        private _dataElementRef: dataElemType;

        constructor(elementName: string, dataElement: dataElemType) {
            super(elementName, dataElement.type, false);
            this._dataElementRef = dataElement;
        }

        /** @override */
        getData() {
            return this._dataElementRef.dataElementRef;
        }
    }

    export class IntDataValueElement extends DataValueElement {
        constructor(dataElement: DataElement.IntDataElement) {
            super('data-value-int', dataElement);
        }
    }

    export class FloatDataValueElement extends DataValueElement {
        constructor(dataElement: DataElement.FloatDataElement) {
            super('data-value-float', dataElement);
        }
    }

    export class CharDataValueElement extends DataValueElement {
        constructor(dataElement: DataElement.CharDataElement) {
            super('data-value-char', dataElement);
        }
    }

    export class StringDataValueElement extends DataValueElement {
        constructor(dataElement: DataElement.StringDataElement) {
            super('data-value-string', dataElement);
        }
    }

    export class BooleanDataValueElement extends DataValueElement {
        constructor(dataElement: DataElement.BooleanDataElement) {
            super('data-value-boolean', dataElement);
        }
    }
}
