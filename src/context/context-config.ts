import { createContext } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IContextConfig } from '../@types/context';

// -- defaults -------------------------------------------------------------------------------------

/**
 * Default values for the top-level configurations context.
 */
export const ContextConfigDefaults: IContextConfig = {
    theme: 'light',
};

// -- instance -------------------------------------------------------------------------------------

/**
 * Context instance for the top-level configurations.
 */
export const ContextConfig = createContext<IContextConfig>(ContextConfigDefaults);
