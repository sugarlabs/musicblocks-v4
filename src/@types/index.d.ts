/** Interface representing feature flag toggles for a component. */
export interface IFeatureFlags {
    [name: string]: boolean;
}

/** Interface representing a config file. */
export interface IConfig {
    /** Component entries. */
    components: {
        /** Name of the component. */
        name: string;
        /** Names of the components that precede it in dependency graph. */
        parents?: string[];
        /** Feature flag toggles for the component (handled by the component). */
        flags?: IFeatureFlags;
        /** Names of the syntax elements to register. */
        elements?: string[] | boolean;
    }[];
}

import { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';

/** Interface representing a component's API. */
export interface IComponent {
    /**
     * Mounts the component (loads subcomponents, mounts DOM elements, etc.).
     *
     * @param flags - feature flag toggles
     */
    mount(flags?: IFeatureFlags): Promise<void>;
    /**
     * Sets up the component — initializes component after it is mounted.
     */
    setup(): Promise<void>;
    /** Syntax element specification object for the component. */
    specification?: {
        [identifier: string]: IElementSpecification;
    };
}
