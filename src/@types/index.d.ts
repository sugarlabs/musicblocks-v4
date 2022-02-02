/** Interface representing a config file. */
export interface IConfig {
    /** Component entries. */
    components: {
        /** Name of the component. */
        name: string;
        /** Names of the syntax elements to register. */
        elements: string[] | boolean;
    }[];
}

import {
    IElementSpecificationEntryBlock,
    IElementSpecificationEntryData,
    IElementSpecificationEntryExpression,
    IElementSpecificationEntryStatement,
} from '@sugarlabs/musicblocks-v4-lib/@types/specification';

/** Interface representing a component's API. */
export interface IComponent {
    /**
     * Sets up the component inside the DOM container.
     * @param container DOM container
     */
    mount(container: HTMLElement): void;
    /** Syntax element specification object for the component. */
    specification: {
        [identifier: string]:
            | IElementSpecificationEntryData
            | IElementSpecificationEntryExpression
            | IElementSpecificationEntryStatement
            | IElementSpecificationEntryBlock;
    };
}
