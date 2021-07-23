/**
 * Interface for the top-level configurations context.
 */

export interface IConfig {
    theme: 'light' | 'dark';
    language: string;
    horizontalScroll: boolean;
    turtleWrap: boolean;
    blockSize: number;
    masterVolume: number;
}

export interface IContextConfig {
    /** UI theme. */
    config: IConfig;
    setConfig: (config: IConfig) => void;
}
