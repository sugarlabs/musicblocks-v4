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
