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

// jsdom ships no ResizeObserver, so any component that measures itself through one (the Trash, the
// value brick's input) would throw on mount. Components re-measure explicitly alongside `observe`,
// so a stub that never fires is enough to render them; size-change behaviour is not covered here.
Object.defineProperty(globalThis, 'ResizeObserver', {
    value: class {
        observe() {}
        unobserve() {}
        disconnect() {}
    },
    writable: true,
});
