/** Type that represents the map of each component identifier with related fields. */
export type TComponentMap = {
    [id: string]: {
        /** Relative path to folder containing the component's modules. */
        path: string;
        /** Display name of the component. */
        name: string;
        /** Description of the component. */
        desc: string;
    };
};
