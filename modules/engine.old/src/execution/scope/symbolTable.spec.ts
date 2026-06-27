import { SymbolTableStack, SymbolTableManager } from './symbolTable';

// -- types ----------------------------------------------------------------------------------------

import type { ISymbolTableStack } from '../../@types/scope';

type TSymbolDataProcess = {
    pc: number;
};

type TSymbolDataVariable = {
    type: string;
    value: boolean | number | string;
};

// -------------------------------------------------------------------------------------------------

describe('Symbol Table', () => {
    const symbolTableManager = new SymbolTableManager();

    let symbolTable0: ISymbolTableStack;
    let symbolTable1: ISymbolTableStack;

    describe('Symbol Table stack', () => {
        symbolTable0 = symbolTableManager.createSymbolTableStack();

        it('adds new local symbols', () => {
            expect(() => {
                symbolTable0.addSymbol('proc 0', {
                    type: 'process',
                    data: {
                        pc: -1,
                    },
                });
            }).not.toThrowError();

            expect(() => {
                symbolTable0.addSymbol('var 0', {
                    type: 'variable',
                    data: {
                        type: 'boolean',
                        value: true,
                    },
                });
            }).not.toThrowError();

            expect(() => {
                symbolTable0.addSymbol('var 1', {
                    type: 'variable',
                    data: {
                        type: 'string',
                        value: 'dummy',
                    },
                });
            }).not.toThrowError();
        });

        it.todo('updates an existing local execution symbol');

        it('adds new global symbols', () => {
            expect(() => {
                symbolTable0.addSymbol(
                    'var 1',
                    {
                        type: 'variable',
                        data: {
                            type: 'number',
                            value: 5,
                        },
                    },
                    'global',
                );
            }).not.toThrowError();
        });

        it.todo('updates an existing global execution symbol');

        it('returns existing local symbol', () => {
            const symProc0 = symbolTable0.getSymbol('proc 0')!;
            expect(symProc0).not.toEqual(undefined);
            expect(symProc0.type).toBe('process');
            expect((symProc0.data as TSymbolDataProcess).pc).toBe(-1);
        });

        it('returns existing global symbol', () => {
            const symVar1 = symbolTable0.getSymbol('var 1', 'global')!;
            expect(symVar1).not.toEqual(undefined);
            expect(symVar1.type).toBe('variable');
            expect((symVar1.data as TSymbolDataVariable).type).toBe('number');
            expect((symVar1.data as TSymbolDataVariable).value).toBe(5);
        });

        it('returns shadowed (local shadowing global) variable', () => {
            const symVar1 = symbolTable0.getSymbol('var 1')!;
            expect(symVar1).not.toEqual(undefined);
            expect(symVar1.type).toBe('variable');
            expect((symVar1.data as TSymbolDataVariable).type).toBe('string');
            expect((symVar1.data as TSymbolDataVariable).value).toBe('dummy');
        });

        it('returns non-existing local symbol entry as undefined', () => {
            expect(symbolTable0.getSymbol('proc')).toEqual(undefined);
        });

        it('returns non-existing global symbol entry as undefined', () => {
            expect(symbolTable0.getSymbol('proc', 'global')).toEqual(undefined);
        });

        it('removes an existing local symbol', () => {
            expect(() => {
                symbolTable0.removeSymbol('var 0');
            }).not.toThrowError();

            symbolTable0.addSymbol('var 0', {
                type: 'variable',
                data: {
                    type: 'boolean',
                    value: true,
                },
            });
        });

        it('removes an existing global symbol', () => {
            expect(() => {
                symbolTable0.removeSymbol('var 1', 'global');
            }).not.toThrowError();

            symbolTable0.addSymbol(
                'var 1',
                {
                    type: 'variable',
                    data: {
                        type: 'number',
                        value: 5,
                    },
                },
                'global',
            );
        });

        it('throws error on removing a non-existing local symbol', () => {
            expect(() => {
                symbolTable0.removeSymbol('var 2');
            }).toThrowError('InvalidSymbolError: Symbol "var 2" doesn\'t exist');
        });

        it('throws error on removing a non-existing global symbol', () => {
            expect(() => {
                symbolTable0.removeSymbol('var 2', 'global');
            }).toThrowError('InvalidSymbolError: Symbol "var 2" doesn\'t exist');
        });

        it('lists symbols by name', () => {
            const list = symbolTable0.listSymbols('name');
            expect([...Object.keys(list)].sort().join(', ')).toBe('proc 0, var 0, var 1');
            expect(list['proc 0'].type).toBe('process');
            expect(list['var 0'].type).toBe('variable');
            expect(list['var 1'].type).toBe('variable');
        });

        it('lists symbols grouped by type', () => {
            const list = symbolTable0.listSymbols('type');
            expect([...Object.keys(list)].sort().join(', ')).toBe('process, variable');
            expect(Object.entries(list['process']).length).toBe(1);
            expect(Object.entries(list['process'])[0][0]).toBe('proc 0');
            expect(Object.entries(list['variable']).length).toBe(2);
            expect(['var 0', 'var 1'].includes(Object.entries(list['variable'])[0][0])).toBe(true);
            expect(['var 0', 'var 1'].includes(Object.entries(list['variable'])[1][0])).toBe(true);
        });

        it('pushes symbol table frame and add symbols into it', () => {
            symbolTable0.pushFrame();
            symbolTable0.addSymbol('var 0', {
                type: 'variable',
                data: {
                    type: 'boolean',
                    value: false,
                },
            });

            const symVar0 = symbolTable0.getSymbol('var 0')!;
            expect(symVar0).not.toEqual(undefined);
            expect(symVar0.type).toBe('variable');
            expect((symVar0.data as TSymbolDataVariable).type).toBe('boolean');
            expect((symVar0.data as TSymbolDataVariable).value).toBe(false);
        });

        it('pops (previously pushed) symbol table frame', () => {
            symbolTable0.popFrame();
            const symVar0 = symbolTable0.getSymbol('var 0')!;
            expect(symVar0).not.toEqual(undefined);
            expect(symVar0.type).toBe('variable');
            expect((symVar0.data as TSymbolDataVariable).type).toBe('boolean');
            expect((symVar0.data as TSymbolDataVariable).value).toBe(true);
        });
    });

    describe('Symbol Table Manager', () => {
        it('creates multiple symbol table stacks with independent behavior', () => {
            symbolTable1 = symbolTableManager.createSymbolTableStack();

            symbolTable1.addSymbol('var 0', {
                type: 'variable',
                data: {
                    type: 'string',
                    value: 'foobar',
                },
            });

            symbolTable1.pushFrame();

            symbolTable1.addSymbol('var 1', {
                type: 'variable',
                data: {
                    type: 'string',
                    value: 'mystring',
                },
            });

            {
                const symVar = symbolTable0.getSymbol('var 0')!;
                expect(symVar).not.toEqual(undefined);
                expect(symVar.type).toBe('variable');
                expect((symVar.data as TSymbolDataVariable).type).toBe('boolean');
                expect((symVar.data as TSymbolDataVariable).value).toBe(true);
            }

            {
                const symVar = symbolTable0.getSymbol('var 1')!;
                expect(symVar).not.toEqual(undefined);
                expect(symVar.type).toBe('variable');
                expect((symVar.data as TSymbolDataVariable).type).toBe('string');
                expect((symVar.data as TSymbolDataVariable).value).toBe('dummy');
            }

            {
                const symVar = symbolTable1.getSymbol('var 0')!;
                expect(symVar).not.toEqual(undefined);
                expect(symVar.type).toBe('variable');
                expect((symVar.data as TSymbolDataVariable).type).toBe('string');
                expect((symVar.data as TSymbolDataVariable).value).toBe('foobar');
            }

            {
                const symVar = symbolTable1.getSymbol('var 1')!;
                expect(symVar).not.toEqual(undefined);
                expect(symVar.type).toBe('variable');
                expect((symVar.data as TSymbolDataVariable).type).toBe('string');
                expect((symVar.data as TSymbolDataVariable).value).toBe('mystring');
            }

            {
                const symVar = symbolTable1.getSymbol('var 1', 'global')!;
                expect(symVar).not.toEqual(undefined);
                expect(symVar.type).toBe('variable');
                expect((symVar.data as TSymbolDataVariable).type).toBe('number');
                expect((symVar.data as TSymbolDataVariable).value).toBe(5);
            }
        });

        it('returns symbol table stack using existing symbol table stack ID', () => {
            const symbolTable = symbolTableManager.getSymbolTableStack(symbolTable1.symbolTableID);
            expect(symbolTable instanceof SymbolTableStack).toBe(true);
            const symVar = symbolTable1.getSymbol('var 1')!;
            expect(symVar).not.toEqual(undefined);
            expect(symVar.type).toBe('variable');
            expect((symVar.data as TSymbolDataVariable).type).toBe('string');
            expect((symVar.data as TSymbolDataVariable).value).toBe('mystring');
        });

        it('throws error on fetching symbol table stack using non-existing symbol table ID', () => {
            expect(() => {
                symbolTableManager.getSymbolTableStack('foobar');
            }).toThrowError(
                'InvalidAccessError: Symbol Table stack with ID "foobar" doesn\'t exist',
            );
        });

        it('removes symbol table stack using existing symbol table ID', () => {
            expect(() => {
                symbolTableManager.removeSymbolTableStack(symbolTable0.symbolTableID);
            }).not.toThrowError();
        });

        it('throws error on removing symbol table stack using non-existing symbol table ID', () => {
            expect(() => {
                symbolTableManager.removeSymbolTableStack('foobar');
            }).toThrowError(
                'InvalidAccessError: Symbol Table stack with ID "foobar" doesn\'t exist',
            );
        });

        it('resets symbol tables', () => {
            symbolTableManager.reset();
            expect(() => {
                symbolTableManager.getSymbolTableStack(symbolTable1.symbolTableID);
            }).toThrowError(
                `InvalidAccessError: Symbol Table stack with ID "${symbolTable1.symbolTableID}" doesn't exist`,
            );
        });

        it('adds a new global execution symbol', () => {
            expect(() => {
                symbolTableManager.addGlobalSymbol('proc', {
                    type: 'process',
                    data: {
                        pc: -1,
                    },
                });
            }).not.toThrowError();
        });

        it.todo('updates an existing global execution symbol');

        it('returns an existing global execution symbol', () => {
            const symbol = symbolTableManager.getGlobalSymbol('proc')!;
            expect(symbol.type).toBe('process');
            expect((symbol.data as TSymbolDataProcess).pc).toBe(-1);
        });

        it('lists global symbols', () => {
            expect(Object.keys(symbolTableManager.listGlobalSymbols()).join('')).toBe('proc');
        });

        it('removes an existing global execution symbol', () => {
            expect(() => {
                symbolTableManager.removeGlobalSymbol('proc');
            }).not.toThrowError();
        });

        it('throws error on removing a non-existing global execution symbol', () => {
            expect(() => {
                symbolTableManager.removeGlobalSymbol('proc');
            }).toThrowError('InvalidSymbolError: Symbol "proc" doesn\'t exist');
        });
    });
});
