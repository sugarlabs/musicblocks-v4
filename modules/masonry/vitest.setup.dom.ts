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

function isStorageLike(candidate: unknown): candidate is Storage {
    if (!candidate || typeof candidate !== 'object') {
        return false;
    }
    const storage = candidate as Partial<Storage>;
    return (
        typeof storage.clear === 'function' &&
        typeof storage.getItem === 'function' &&
        typeof storage.setItem === 'function' &&
        typeof storage.removeItem === 'function'
    );
}

function resolveStorage(
    prop: 'localStorage' | 'sessionStorage',
    fallbackFactory: () => Storage,
): { instance: Storage; isNative: boolean } {
    const targets = [
        globalThis,
        typeof window !== 'undefined' && window !== globalThis ? window : null,
    ].filter((target): target is typeof globalThis => target !== null && target !== undefined);

    for (const target of targets) {
        try {
            // Wrap in try/catch because touching localStorage directly in Node 25+ throws SecurityError.
            const candidate = (target as Record<string, unknown>)[prop];
            if (isStorageLike(candidate)) {
                candidate.setItem('__test_probe__', '1');
                const val = candidate.getItem('__test_probe__');
                candidate.removeItem('__test_probe__');
                if (val === '1') {
                    return { instance: candidate, isNative: true };
                }
            }
        } catch {
            // Getter threw (or storage is broken), so move on to fallback.
        }
    }

    return { instance: fallbackFactory(), isNative: false };
}

function ensureStorageGlobal(
    target: object,
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
            (target as Record<string, unknown>)[key] = instance;
        }
    } catch {
        (target as Record<string, unknown>)[key] = instance;
    }
}

const resolvedLocalStorage = resolveStorage('localStorage', () => new MemoryStorage());
const resolvedSessionStorage = resolveStorage('sessionStorage', () => new MemoryStorage());

const shouldUseMemoryStorage =
    !resolvedLocalStorage.isNative || !resolvedSessionStorage.isNative;

const localStorageInstance = shouldUseMemoryStorage
    ? resolvedLocalStorage.instance instanceof MemoryStorage
        ? resolvedLocalStorage.instance
        : new MemoryStorage()
    : resolvedLocalStorage.instance;

const sessionStorageInstance = shouldUseMemoryStorage
    ? resolvedSessionStorage.instance instanceof MemoryStorage
        ? resolvedSessionStorage.instance
        : new MemoryStorage()
    : resolvedSessionStorage.instance;

// If native storage works for both, keep native Storage so we don't break native prototypes.
// If either requires MemoryStorage, expose MemoryStorage as Storage and ensure both
// localStorage and sessionStorage use MemoryStorage instances so prototype and instanceof
// checks (and vi.spyOn(Storage.prototype, ...)) remain fully aligned and consistent.
if (shouldUseMemoryStorage) {
    globalThis.Storage = MemoryStorage as unknown as typeof Storage;
    if (typeof window !== 'undefined') {
        window.Storage = MemoryStorage as unknown as typeof Storage;
    }
}

ensureStorageGlobal(globalThis, 'localStorage', localStorageInstance);
ensureStorageGlobal(globalThis, 'sessionStorage', sessionStorageInstance);

if (typeof window !== 'undefined') {
    ensureStorageGlobal(window, 'localStorage', localStorageInstance);
    ensureStorageGlobal(window, 'sessionStorage', sessionStorageInstance);
}
