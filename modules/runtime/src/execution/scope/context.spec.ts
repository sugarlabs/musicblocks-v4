import { ContextManager } from './context';
import type { IContextStack } from '../../@types/scope';

type TContextDummy = { foo: number; bar: string };

// -------------------------------------------------------------------------------------------------

describe('Context module', () => {
    const contextManager = new ContextManager<TContextDummy>({
        foo: 4,
        bar: 'red',
    });

    let contextStack0: IContextStack<TContextDummy>;
    let contextStack1: IContextStack<TContextDummy>;

    describe('Context stack', () => {
        beforeAll(() => {
            contextStack0 = contextManager.createContextStack();
        });

        it('returns global context', () => {
            expect(
                Object.entries(contextStack0.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-4');
        });

        it('updates local key-map', () => {
            contextStack0.contextLocalKeyMap = {
                ...contextStack0.contextLocalKeyMap,
                foo: 8,
            };

            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-8');

            // Global must stay unchanged
            expect(
                Object.entries(contextStack0.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-4');
        });

        it("pushes context frame, and updates new frame's key-map", () => {
            contextStack0.pushFrame();
            contextStack0.contextLocalKeyMap = {
                ...contextStack0.contextLocalKeyMap,
                bar: 'blue',
            };

            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-blue, foo-8');

            expect(
                Object.entries(contextStack0.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-4');
        });

        it('pops (previously pushed) context frames', () => {
            contextStack0.popFrame();
            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-8');
        });

        it('throws error on popping root context frame', () => {
            expect(() => {
                contextStack0.popFrame();
            }).toThrowError('InvalidOperationError: No context frame remaining to pop');
        });
    });

    describe('Context Manager', () => {
        beforeAll(() => {
            contextStack1 = contextManager.createContextStack();
        });

        it('creates multiple context stacks having independent behavior', () => {
            contextStack0.contextLocalKeyMap = {
                ...contextStack0.contextLocalKeyMap,
                foo: 6,
            };
            contextStack1.contextLocalKeyMap = {
                ...contextStack0.contextLocalKeyMap,
                foo: 7,
            };

            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-6');
            expect(
                Object.entries(contextStack1.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-7');

            contextStack0.pushFrame();
            contextStack0.contextLocalKeyMap = {
                ...contextStack0.contextLocalKeyMap,
                bar: 'yellow',
            };
            contextStack1.pushFrame();
            contextStack1.contextLocalKeyMap = {
                ...contextStack1.contextLocalKeyMap,
                bar: 'green',
            };

            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-yellow, foo-6');
            expect(
                Object.entries(contextStack1.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-green, foo-7');

            contextStack0.popFrame();
            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-6');
            expect(
                Object.entries(contextStack1.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-green, foo-7');

            contextStack1.popFrame();
            expect(
                Object.entries(contextStack0.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-6');
            expect(
                Object.entries(contextStack1.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-7');
        });

        it('updates global context key-map from one context stack that reflects on another', () => {
            contextStack0.contextGlobalKeyMap = {
                foo: 5,
                bar: 'purple',
            };
            expect(
                Object.entries(contextStack1.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-purple, foo-5');

            contextStack1.contextGlobalKeyMap = {
                foo: 3,
                bar: 'lime',
            };
            expect(
                Object.entries(contextStack0.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-lime, foo-3');
        });

        it('fetches context stack using existing context stack ID', () => {
            const cs = contextManager.getContextStack(contextStack0.contextID);
            expect(
                Object.entries(cs.contextLocalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-6');
        });

        it('throws error on fetching context stack using non-existing context stack ID', () => {
            expect(() => {
                contextManager.getContextStack('foobar');
            }).toThrowError(`InvalidAccessError: Context stack with ID "foobar" doesn't exist`);
        });

        it('removes context stack using existing context stack ID', () => {
            expect(() => {
                contextManager.removeContextStack(contextStack1.contextID);
            }).not.toThrowError();
        });

        it('throws error on removing context stack using non-existing context stack ID', () => {
            expect(() => {
                contextManager.removeContextStack(contextStack1.contextID);
            }).toThrowError(
                `InvalidAccessError: Context stack with ID "${contextStack1.contextID}" doesn't exist`,
            );
        });

        it('updates global context key-map with commit', () => {
            contextManager.reset();
            expect(
                Object.entries(contextManager.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-red, foo-4');

            contextManager.updateContextGlobalKeyMap({ foo: 16, bar: 'coral' }, true);
            contextManager.reset();
            expect(
                Object.entries(contextManager.contextGlobalKeyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', '),
            ).toBe('bar-coral, foo-16');
        });
    });
});
