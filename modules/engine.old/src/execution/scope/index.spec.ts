import {
    _getContextManager,
    _getSymbolTableManager,
    registerContext,
    deregisterContext,
    hasContext,
    ScopeStack,
    addGlobalSymbol,
    removeGlobalSymbol,
    listGlobalSymbols,
    getGlobalSymbol,
} from '.';

// -- types ----------------------------------------------------------------------------------------

import type { IContextStack, IScopeStack } from '../../@types/scope';

type TContextPainter = {
    color: string;
    width: number;
};

type TContextSinger = {
    volume: number;
};

// -------------------------------------------------------------------------------------------------

const keyMapPainter: TContextPainter = {
    color: 'red',
    width: 4,
};

const keyMapSinger: TContextSinger = {
    volume: 50,
};

describe('Scope Module', () => {
    it('registers new context key-maps', () => {
        registerContext('painter', {
            color: 'red',
        });
        expect(hasContext('painter')).toBe(true);
    });

    it('re-registers existing context key-maps by overwriting', () => {
        registerContext('painter', {
            color: 'red',
            width: 4,
        });
        expect(hasContext('painter')).toBe(true);
    });

    it('deregisters context key-maps', () => {
        deregisterContext('painter');
        expect(hasContext('painter')).toBe(false);
    });

    let scopeStack: IScopeStack;

    describe('Local Scope Stack', () => {
        beforeAll(() => {
            registerContext('painter', keyMapPainter);
            registerContext('singer', keyMapSinger);
        });

        afterAll(() => {
            deregisterContext('painter');
            deregisterContext('singer');
        });

        it('initializes without arguments', () => {
            scopeStack = new ScopeStack();

            const contextPainter = scopeStack.getContext('painter');
            expect(
                Object.entries(contextPainter.contextGlobalKeyMap)
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                    .map(([key, value]) => `${key}-${value}`)
                    .join(', '),
            ).toBe('color-red, width-4');

            const symbolTable = scopeStack.getSymbolTable();
            expect(Object.keys(symbolTable.listSymbols()).length).toBe(0);
        });

        it('initializes with existing context stacks', () => {
            const contextManager = _getContextManager('painter');
            const context =
                contextManager.createContextStack() as unknown as IContextStack<TContextPainter>;
            context.contextLocalKeyMap = {
                color: 'blue',
                width: 8,
            };

            scopeStack = new ScopeStack({
                painter: context,
            });

            const contextPainter = scopeStack.getContext('painter');
            expect(
                Object.entries(contextPainter.contextLocalKeyMap)
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                    .map(([key, value]) => `${key}-${value}`)
                    .join(', '),
            ).toBe('color-blue, width-8');

            const symbolTable = scopeStack.getSymbolTable();
            expect(Object.keys(symbolTable.listSymbols()).length).toBe(0);
        });

        it('initializes with existing context stacks and symbol table stack', () => {
            const contextManager = _getContextManager('painter');
            const contextStack =
                contextManager.createContextStack() as unknown as IContextStack<TContextPainter>;
            contextStack.contextLocalKeyMap = {
                color: 'lime',
                width: 6,
            };

            const symbolTableManager = _getSymbolTableManager();
            const symbolTableStack = symbolTableManager.createSymbolTableStack();
            symbolTableStack.addSymbol('proc', {
                type: 'process',
                data: {
                    pc: -1,
                },
            });

            scopeStack = new ScopeStack(
                {
                    painter: contextStack,
                },
                symbolTableStack,
            );

            const contextPainter = scopeStack.getContext('painter');
            expect(
                Object.entries(contextPainter.contextLocalKeyMap)
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                    .map(([key, value]) => `${key}-${value}`)
                    .join(', '),
            ).toBe('color-lime, width-6');

            expect(Object.keys(symbolTableStack.listSymbols()).join('')).toBe('proc');
        });
    });

    describe('Global Scope', () => {
        it.todo('returns corresponding global execution context on querying an existing name');

        it.todo('throws error on querying a non-existing context name');

        it('adds a new global execution symbol', () => {
            expect(() => {
                addGlobalSymbol('proc', {
                    type: 'process',
                    data: {
                        pc: -1,
                    },
                });
            }).not.toThrowError();
        });

        it('returns an existing global execution symbol', () => {
            const symbol = getGlobalSymbol('proc')!;
            expect(symbol.type).toBe('process');
            expect((symbol.data as { pc: number }).pc).toBe(-1);
        });

        it('lists global symbols', () => {
            expect(Object.keys(listGlobalSymbols()).join('')).toBe('proc');
        });

        it('removes an existing global execution symbol', () => {
            removeGlobalSymbol('proc');
            expect(Object.keys(listGlobalSymbols()).length).toBe(0);
        });
    });
});
