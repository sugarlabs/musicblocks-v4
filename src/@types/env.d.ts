/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.jsonc';

declare module '*.wasm';

declare module 'virtual:stats' {
    const stats:
        | {
              i18n: Record<string, number>;
              assets: Record<string, number>;
              modules: Record<string, number>;
          }
        | undefined;
}
