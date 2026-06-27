import { addGlobalSymbol, getGlobalSymbol } from '../scope';
import { setPCOverride, clearPCOverride, setExecutionItem, getNextElement } from '../parser';

import {
    ElementData,
    ElementExpression,
    ElementArgument,
} from '../../syntax/elements/elementArgument';
import { ElementStatement, ElementBlock } from '../../syntax/elements/elementInstruction';

// -- types ----------------------------------------------------------------------------------------

import type { TData, TDataName } from '../../@types/data';
import type { IVariable, TPCOverride } from '../../@types/execution';
import type { IContext, ISymbolTable } from '../../@types/scope';

// -- public functions -----------------------------------------------------------------------------

/**
 * Adds a new variable entry to the symbol table.
 * @param variable name of the variable
 * @param dataType data type of the variable
 * @param value value of the variable
 */
export function declareVariable(variable: string, dataType: 'number', value: number): void;
export function declareVariable(variable: string, dataType: 'string', value: string): void;
export function declareVariable(variable: string, dataType: 'boolean', value: boolean): void;
export function declareVariable(variable: string, dataType: TDataName, value: TData): void {
    addGlobalSymbol(variable, {
        type: dataType,
        data: { value },
    });
}

/**
 * Fetches a variable entry from the symbol table.
 * @param variable name of the variable
 * @returns the variable entry if present, else `null`
 */
export function queryVariable(variable: string): IVariable | null {
    const { type, data } = getGlobalSymbol(variable)!;
    return {
        dataType: type as TDataName,
        value: (data as { value: TData }).value,
    };
}

/**
 * Sets a program counter override signal for the current execution item.
 * @param signal program counter override signal
 */
export function overrideProgramCounter(signal: TPCOverride): void {
    setPCOverride(signal);
}

/**
 * Clears any program counter override signal for the current execution item.
 */
export function releaseProgramCounter(): void {
    clearPCOverride();
}

/**
 * Runs a process, routine, or crumb stack from start to end.
 * @param nodeID syntax tree node ID of the starting node
 */
export function run(
    nodeID: string,
    scope: {
        context: IContext<Record<string, unknown>>;
        symbolTable: ISymbolTable;
    },
): void {
    abstract class ElementDataCover extends ElementData<TData> {
        abstract evaluate(scope: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        }): void;
    }

    abstract class ElementExpressionCover extends ElementExpression<TData> {
        abstract evaluate(
            scope: {
                context: IContext<Record<string, unknown>>;
                symbolTable: ISymbolTable;
            },
            params: { [key: string]: TData },
        ): void;
    }

    setExecutionItem(nodeID);

    const memo: { [key: string]: TData } = {};

    function __execute(): void {
        const element = getNextElement();

        if (element === null) {
            return;
        }

        const { instance, type, marker } = element;
        if (type === 'Argument') {
            if (instance instanceof ElementDataCover) {
                instance.evaluate(scope);
            } /* instance instanceof ElementExpressionCover */ else {
                (instance as ElementExpressionCover).evaluate(scope, memo);
            }

            const value = (instance as unknown as ElementArgument<TData>).value;

            if (marker !== null) {
                memo[marker] = value;
            }
        } else {
            if (instance instanceof ElementStatement) {
                instance.onVisit(scope, memo);
            } /* instance instanceof ElementBlock */ else {
                if (marker !== '__rollback__') {
                    (instance as ElementBlock).onVisit(scope, memo);
                } else {
                    (instance as ElementBlock).onExit(scope, {});
                }
            }
        }

        __execute();
    }

    __execute();
}
