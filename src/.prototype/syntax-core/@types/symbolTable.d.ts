import { TBoolean, TString } from '../primitiveElements';
import { TPrimitive, TPrimitiveName } from './primitiveTypes';

export interface ISymbolTable {
    symbolExists: (symbol: TString) => TBoolean;
    addSymbol: (symbol: TString, data: TPrimitive) => void;
    getSymbolData: (symbol: TString) => TPrimitive;
}
