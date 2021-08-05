/**
 * Interface for the top-level configurations context.
 */

import { ITurtleModel } from './artboard';

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

/**
 * Interface for artBoard Context
 */

export interface IArtBoardContext {
    artBoardList: IArtboardModel[];
    setArtBoardList: (artboard: IartBoard) => void;
}
