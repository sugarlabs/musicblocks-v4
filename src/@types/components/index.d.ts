import { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';
import type { TAsset } from '../core/assets';

/** Interface representing a component's API. */
export interface IComponent {
    /** Mounts the component (loads subcomponents, mounts DOM elements, etc.). */
    mount(): Promise<void>;
    /** Sets up the component — initializes component after it is mounted. */
    setup(): Promise<void>;
    /** Items injected into the component after load. */
    injected: {
        /** Feature flags. */
        flags?: { [flag: string]: boolean };
        /** i18n strings. */
        i18n?: { [key: string]: string };
        /** Asset entries. */
        assets?: { [assetId: string]: TAsset };
    };
    /** Syntax elements exposed. */
    elements?: Record<string, IElementSpecification>;
}

// -------------------------------------------------------------------------------------------------

/** Component identifier string. */
export type TComponentId = 'menu' | 'editor' | 'painter' | 'singer';

/** Type definition for each component's definition object. */
export interface IComponentDefinition {
    /** Dependent components. */
    dependencies: {
        /** List of identifiers of required dependent components. */
        required: TComponentId[];
        /** List of identifiers of optional dependent components. */
        optional: TComponentId[];
    };
    /** Feature flag map. */
    flags: {
        [flag: string]: 'boolean';
    };
    /** i18n string identifier - description map. */
    strings: {
        [string: string]: string;
    };
    /** Assets used. */
    assets: string[];
}

/**
 * Type definition for each component's definition object extended with it's exposed Syntax elements.
 */
export interface IComponentDefinitionExtended extends IComponentDefinition {
    elements?: Omit<IComponent['elements'], 'prototype'>;
}

/** Type that represents the map of each component identifier with related fields. */
export type TComponentManifest = Record<
    TComponentId,
    {
        /** Relative path to folder containing the component's modules. */
        path: string;
        /** Display name of the component. */
        name: string;
        /** Description of the component. */
        desc: string;
        /** Component definition. */
        definition: IComponentDefinition;
    }
>;
