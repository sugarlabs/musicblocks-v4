const BASE_URL = process.env.BASE_PATH ?? window?.location?.pathname ?? '/';

const enableSW = process.env.NODE_ENV === 'development' ? false : true;

/**
 * Used to load service worker in production only
 *
 */
export const loadServiceWorker = () => {
    if ('serviceWorker' in navigator && enableSW) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register(`${BASE_URL}service-worker.js`)
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
};

/**
 * Used to construct a string URL to the location of the WASM module
 * which is included as an asset
 *
 * Usage:
 * import wasmModule from '/path/to/file.wasm';
 * const urlToWasmFile = constructWasmUrl(wasmModule);
 *
 * @param importPath the WASM module import
 * @returns URL to WASM module included as asset
 */
export const constructWasmUrl = (importPath: string): string => {
    if (process.env.NODE_ENV === 'production') {
        return window.location.origin + window.location.pathname + importPath;
    } else {
        return importPath;
    }
};
