import { ReportHandler } from 'web-vitals';

/**
 * If you want to start measuring performance in your app, pass a function to log results
 * (e.g.: reportWebVitals(console.log))
 * @param onPerfEntry
 */
export function reportWebVitals(onPerfEntry?: ReportHandler): void {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(onPerfEntry);
            getFID(onPerfEntry);
            getFCP(onPerfEntry);
            getLCP(onPerfEntry);
            getTTFB(onPerfEntry);
        });
    }
}

/**
 * Used to load service worker in production only.
 */
export function loadServiceWorker() {
    const BASE_URL = import.meta.env.BASE_URL ?? window?.location?.pathname ?? '/';
    const ENABLE_SW = import.meta.env.DEV ? false : true;

    if ('serviceWorker' in navigator && ENABLE_SW) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register(`${BASE_URL}sw.js`)
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

/**
 * Used to construct a string URL to the location of the WASM module which is included as an asset.
 *
 * Usage:
 * import wasmModule from '/path/to/file.wasm';
 * const urlToWasmFile = constructWasmUrl(wasmModule);
 *
 * @param importPath the WASM module import
 * @returns URL to WASM module included as asset
 */
export function constructWasmUrl(importPath: string): string {
    if (import.meta.env.PROD) {
        return window.location.origin + window.location.pathname + importPath;
    } else {
        return importPath;
    }
}
