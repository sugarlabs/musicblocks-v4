/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.png';
declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.jsonc';

declare module '*.wasm';
