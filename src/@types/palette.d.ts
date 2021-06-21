/**
 * Interface for the Palette component's View props.
 */
export interface IPaletteProps {
    /** List of palette sections. */
    sections: string[];
    subSections: string[];
    selectedSection: number;
    hideSubSection: boolean;
    changeSelectedSection: (arg: number) => void;
    toggleHideSubSection: (arg: boolean) => void;
}

/**
 * Interface for the Palette component's Model class.
 */
export interface IPaletteModel {
    /** Store the index of the selected Section */
    selectedSection: number;
    /** Stores whether to show the sub sections of the selected section */
    hideSubSection: boolean;
}
