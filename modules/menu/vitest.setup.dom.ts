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

Object.defineProperty(globalThis, 'ResizeObserver', {
    value: class {
        observe() {}
        unobserve() {}
        disconnect() {}
    },
    configurable: true,
    writable: true,
});
