import { createContext } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IContextConfig, IConfig } from '../@types/context';

// -- defaults -------------------------------------------------------------------------------------

/**
 * Default values for the top-level configurations context.
 */

const defaultConfig: IConfig = {
    theme: 'light',
    language: 'English',
    horizontalScroll: false,
    turtleWrap: false,
    blockSize: 1.5,
};

export const ContextConfigDefaults: IContextConfig = {
    config: defaultConfig,
    setConfig: (config) => config,
};

// -- instance -------------------------------------------------------------------------------------

/**
 * Context instance for the top-level configurations.
 */
export const ContextConfig = createContext<IContextConfig>(ContextConfigDefaults);
