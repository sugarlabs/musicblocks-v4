/**
 * Interface for the Palette component's View props.
 */
export interface IPaletteProps {
    /** List of palette sections. */
    sections: string[];
    subSections: string[];
    selectedSection: number;
    hideSubSection: boolean;
    openedSection: number;
    changeSelectedSection: (arg: number) => void;
    toggleHideSubSection: (arg: boolean) => void;
}
/**
 * Interface for the Palette's section View props
 */
export interface ISectionProps {
    section: string;
    selectedSection: number;
    changeSelectedSection: (arg: number) => void;
    hideSubSection: boolean;
    subSections: string[];
    openedSection: number;
}
/**
 * export interface Palette's SubSection View Props
 */
export interface ISubSectionProps {
    subSections: string[];
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
