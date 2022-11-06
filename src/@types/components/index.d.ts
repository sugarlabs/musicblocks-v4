/** Type that represents the map of each component identifier with related fields. */
export type TComponentMap = {
    [id: string]: {
        /** Relative path to folder containing the component's modules. */
        path: string;
        /** Explanation of the component (for documentation). */
        expl?: string;
    };
};
