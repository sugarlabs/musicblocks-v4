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

// In Node environments or when browser storage is not configured/stubbed,
// localStorage and sessionStorage may be undefined or dysfunctional.
// Provide a robust in-memory Storage implementation compatible with Storage.prototype spies.
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

if (
    typeof globalThis.Storage === 'undefined' ||
    !(function () {
        try {
            new (globalThis.Storage as any)();
            return false;
        } catch (e: any) {
            return !e?.message?.includes('Illegal constructor');
        }
    })()
) {
    globalThis.Storage = MemoryStorage as unknown as typeof Storage;
    if (typeof window !== 'undefined') {
        window.Storage = MemoryStorage as unknown as typeof Storage;
    }
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

const isStorageFunctional = (storage: any): boolean => {
    try {
        if (
            !storage ||
            typeof storage.clear !== 'function' ||
            typeof storage.getItem !== 'function' ||
            typeof storage.setItem !== 'function'
        ) {
            return false;
        }
        storage.setItem('__test_probe__', '1');
        const val = storage.getItem('__test_probe__');
        storage.removeItem('__test_probe__');
        return val === '1';
    } catch {
        return false;
    }
};

const localStorageInstance = isStorageFunctional(globalThis.localStorage)
    ? globalThis.localStorage
    : new MemoryStorage();

const sessionStorageInstance = isStorageFunctional(globalThis.sessionStorage)
    ? globalThis.sessionStorage
    : new MemoryStorage();

ensureStorageGlobal(globalThis, 'localStorage', localStorageInstance);
ensureStorageGlobal(globalThis, 'sessionStorage', sessionStorageInstance);

if (typeof window !== 'undefined') {
    ensureStorageGlobal(window, 'localStorage', localStorageInstance);
    ensureStorageGlobal(window, 'sessionStorage', sessionStorageInstance);
}
