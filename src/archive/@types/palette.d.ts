export type TBrickList = {
    [key: string]: { [key: string]: (string | { [key: string]: string[] })[] };
};

/**
 * Interface for the Palette component's Model class.
 */
export interface IPaletteModel {
    /** Contains list of palette sections. */
    sections: string[];
    /** Contains map of palette sub-sections list per section. */
    subSections: { [key: string]: string[] };
    /** Contains map of palette brick list per sub-section. */
    brickList: TBrickList;
}

/**
 * Interface for the Palette component's View props.
 */
export interface IPaletteProps {
    /** Contains list of palette sections. */
    sections: string[];
    /** Contains map of palette sub-sections list per section. */
    subSections: { [key: string]: string[] };
    /** Contains map of brick list per section. */
    brickList: TBrickList;
}

/**
 * Interface for the Palette's section View props.
 */
export interface IPaletteSectionProps {
    /** Section name. */
    section: string;
    /** `true` if section is opened else `false`. */
    opened: boolean;
    /** Handler to select currently open section. */
    setOpenedSection: (section: string | null) => void;
    /** Contains list of palette sub-sections for the corresponding section. */
    subSections: string[];
    /** Contains map of brick list per sub-section. */
    brickList: { [key: string]: (string | { [key: string]: string[] })[] };
}
/**
 * Interface for the Palette's sub-section View Props.
 */
export interface IPaletteSubSectionProps {
    /** Contains list of palette sub-sections. */
    subSections: string[];
    /** Contains map of brick list per sub-section. */
    brickList: { [key: string]: (string | { [key: string]: string[] })[] };
}

/**
 * Interface for the Palette's pop up View Props.
 */
export interface IPalettePopUpProps {
    /** Sub-section name. */
    subSection: string;
    /** Contains list of bricks in sub-section. */
    brickList: (string | { [key: string]: string[] })[];
}
