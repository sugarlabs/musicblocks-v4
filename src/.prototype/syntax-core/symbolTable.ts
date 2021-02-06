import { TPrimitive, TPrimitiveName } from './@types/primitiveTypes';
import { ISymbolTable } from './@types/symbolTable';
import { TBoolean, TString } from './primitiveElements';

export class SymbolTable implements ISymbolTable {
    private _table: {
        [key: string]: {
            type: TPrimitiveName;
            data: TPrimitive;
        };
    } = {};

    constructor() {}

    symbolExists(symbol: TString) {
        return new TBoolean(symbol.value in this._table);
    }

    addSymbol(symbol: TString, data: TPrimitive) {
        if (symbol.value in this._table) {
            throw Error(`Duplicate symbol: symbol "${symbol.value}" already exists.`);
        }
        this._table[symbol.value] = {
            type: data.type,
            data
        };
    }

    getSymbolData(symbol: TString) {
        if (!(symbol.value in this._table)) {
            throw Error(`Invalid symbol: symbol "${symbol}" does not exist.`);
        }
        return (this._table[symbol.value] as {
            type: TPrimitiveName;
            data: TPrimitive;
        }).data;
    }
}
