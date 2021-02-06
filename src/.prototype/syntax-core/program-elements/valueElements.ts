import { TPrimitive } from '../@types/primitiveTypes';
import { TInt, TFloat, TChar, TString, TBoolean } from '../primitiveElements';
import { ArgumentDataElement } from '../structureElements';
import { SymbolTable } from '../symbolTable';
import { DataElement } from './dataElements';

type TDataElem =
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
        protected _data: TPrimitive;

        constructor(elementName: string, data: TPrimitive) {
            super(elementName, data.type);
            this._data = data;
        }

        /** @override */
        getData(props: { symbolTable?: SymbolTable }) {
            return this._data;
        }
    }

    /** ArgumentDataElement wrapper for primitive TInt type. */
    export class IntElement extends ValueElement {
        constructor(value: number) {
            super('int', new TInt(value));
        }

        update(value: number) {
            this._data.value = value;
        }
    }

    /** ArgumentDataElement wrapper for primitive TFloat type. */
    export class FloatElement extends ValueElement {
        constructor(value: number) {
            super('float', new TFloat(value));
        }

        update(value: number) {
            this._data.value = value;
        }
    }

    /** ArgumentDataElement wrapper for primitive TChar type. */
    export class CharElement extends ValueElement {
        constructor(value: string | number) {
            super('char', new TChar(value));
        }

        update(value: string | number) {
            this._data.value = value;
        }
    }

    /** ArgumentDataElement wrapper for primitive TString type. */
    export class StringElement extends ValueElement {
        constructor(value: string) {
            super('string', new TString(value));
        }

        update(value: string) {
            this._data.value = value;
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

    abstract class DataValueElement extends ValueElement {
        constructor(elementName: string, symbol: TString) {
            super(elementName, symbol);
        }

        update(value: string) {
            this._data.value = value;
        }

        /** @override */
        getData(props: { symbolTable: SymbolTable }) {
            return props.symbolTable.getSymbolData(this._data as TString);
        }
    }

    export class IntDataValueElement extends DataValueElement {
        constructor(symbol: TString) {
            super('data-value-int', symbol);
        }
    }

    export class FloatDataValueElement extends DataValueElement {
        constructor(symbol: TString) {
            super('data-value-float', symbol);
        }
    }

    export class CharDataValueElement extends DataValueElement {
        constructor(symbol: TString) {
            super('data-value-char', symbol);
        }
    }

    export class StringDataValueElement extends DataValueElement {
        constructor(symbol: TString) {
            super('data-value-string', symbol);
        }
    }

    export class BooleanDataValueElement extends DataValueElement {
        constructor(symbol: TString) {
            super('data-value-boolean', symbol);
        }
    }
}
