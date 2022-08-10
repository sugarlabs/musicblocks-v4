/// <reference types="react-scripts" />

declare module '*.png';
declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.wasm';
