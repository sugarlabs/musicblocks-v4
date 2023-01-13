/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.jsonc';
declare module '*.vue';

declare module '*.wasm';
