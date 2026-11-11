if (typeof HTMLCanvasElement !== 'undefined') {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: () => ({
            font: '',
            measureText: () => ({
                width: 0,
                actualBoundingBoxAscent: 0,
                actualBoundingBoxDescent: 0,
            }),
            fillText: () => {},
        }),
        writable: true,
    });
}

// jsdom ships no ResizeObserver, so any component that measures itself through one (the Trash, the
// value brick's input) would throw on mount. Components re-measure explicitly alongside `observe`,
// so a stub that never fires is enough to render them; size-change behaviour is not covered here.
// Left configurable so a suite that needs an observer which actually fires can swap this out with
// `vi.stubGlobal`.
if (typeof ResizeObserver === 'undefined') {
    Object.defineProperty(globalThis, 'ResizeObserver', {
        value: class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
        configurable: true,
        writable: true,
    });
}

// Simple in-memory fallback for environments where localStorage isn't available
// (like Node 25+ without a storage file, or plain Node test runs).
class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
        return this.store.size;
    }

    clear(): void {
        this.store.clear();
    }

    getItem(key: string): string | null {
        const k = String(key);
        return this.store.has(k) ? this.store.get(k)! : null;
    }

    key(index: number): string | null {
        const keys = Array.from(this.store.keys());
        return keys[index] ?? null;
    }

    removeItem(key: string): void {
        this.store.delete(String(key));
    }

    setItem(key: string, value: string): void {
        this.store.set(String(key), String(value));
    }
}

function resolveStorage(
    prop: 'localStorage' | 'sessionStorage',
    fallbackFactory: () => Storage,
): { instance: Storage; isNative: boolean } {
    const targets = [
        globalThis,
        typeof window !== 'undefined' && window !== globalThis ? window : null,
    ].filter(Boolean);

    for (const target of targets) {
        try {
            // Wrap in try/catch because touching localStorage directly in Node 25+ throws SecurityError.
            const storage = (target as any)[prop];
            if (
                storage &&
                typeof storage.clear === 'function' &&
                typeof storage.getItem === 'function' &&
                typeof storage.setItem === 'function' &&
                typeof storage.removeItem === 'function'
            ) {
                storage.setItem('__test_probe__', '1');
                const val = storage.getItem('__test_probe__');
                storage.removeItem('__test_probe__');
                if (val === '1') {
                    return { instance: storage, isNative: true };
                }
            }
        } catch {
            // Getter threw (or storage is broken), so move on to fallback.
        }
    }

    return { instance: fallbackFactory(), isNative: false };
}

function ensureStorageGlobal(
    target: Record<string, any>,
    key: 'localStorage' | 'sessionStorage',
    instance: Storage,
) {
    try {
        const desc = Object.getOwnPropertyDescriptor(target, key);
        if (!desc || desc.configurable) {
            Object.defineProperty(target, key, {
                value: instance,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        } else if (desc.writable) {
            target[key] = instance;
        }
    } catch {
        target[key] = instance;
    }
}

const resolvedLocalStorage = resolveStorage('localStorage', () => new MemoryStorage());
const resolvedSessionStorage = resolveStorage('sessionStorage', () => new MemoryStorage());

// If native storage works, keep native Storage so we don't break native prototypes.
// If we use MemoryStorage, expose MemoryStorage as Storage so vi.spyOn(Storage.prototype, ...)
// in theme.test.ts continues to intercept calls properly.
if (!resolvedLocalStorage.isNative) {
    globalThis.Storage = MemoryStorage as unknown as typeof Storage;
    if (typeof window !== 'undefined') {
        window.Storage = MemoryStorage as unknown as typeof Storage;
    }
}

ensureStorageGlobal(globalThis, 'localStorage', resolvedLocalStorage.instance);
ensureStorageGlobal(globalThis, 'sessionStorage', resolvedSessionStorage.instance);

if (typeof window !== 'undefined') {
    ensureStorageGlobal(window, 'localStorage', resolvedLocalStorage.instance);
    ensureStorageGlobal(window, 'sessionStorage', resolvedSessionStorage.instance);
}
