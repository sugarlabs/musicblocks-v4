import { TAppLanguage } from './config';

/**
 * Interface for the Menu component's Model class.
 */
export interface IMenuModel {
    /** Sets conditional visibility of play and stop buttons */
    playing: boolean;
    /** Contains list of available languages */
    languages: { code: TAppLanguage; name: string }[];
    /** Contains list of project builder brick sizes */
    brickSizes: { value: number; label: string }[];
}

/**
 * Interface for the Menu component's View props
 */
export interface IMenuProps {
    /** `true` if playing else `false` */
    playing: boolean;
    /** Function to trigger on clicking play */
    playHandler: () => void;
    /** Function to trigger on clicking play slowly */
    playSlowHandler: () => void;
    /** Function to trigger on clicking play next step */
    playStepHandler: () => void;
    /** Function to trigger on clicking stop */
    stopHandler: () => void;
    /** Function to trigger on clicking undo */
    undoHandler: () => void;
    /** Function to trigger on clicking redo */
    redoHandler: () => void;
    /** Function to trigger on clicking clear */
    clearHandler: () => void;
    /** Handler to set brick visibility */
    setBrickVisibility: (visible: boolean) => void;
    /** Handler to set brick clamps fold */
    setBrickFold: (fold: boolean) => void;
    /** Function to trigger on clicking new project */
    projectNewHandler: () => void;
    /** Function to trigger on clicking load project */
    projectLoadHandler: () => void;
    /** Function to trigger on clicking save project */
    projectSavehandler: () => void;
    /** Range of master volume slider */
    masterVolumeRange: { min: number; max: number };
    /** Value of master volume slider */
    masterVolume: number;
    /** Handler to set master volume */
    setMasterVolume: (volume: number) => void;
    /** Range of brick size slider */
    brickSizeRange: { min: number; max: number };
    /** Value of brick size slider */
    brickSize: number;
    /** Handler to set brick size */
    setBrickSize: (size: number) => void;
    /** `true` if auto hide is enabled else `false` */
    autoHide: boolean;
    /** Handler to set auto hide */
    setAutoHide: (autoHide: boolean) => void;
    /** `true` if horizontal scroll is enabled else `false` */
    horizontalScroll: boolean;
    /** Handler to set horizontal scroll */
    setHorizontalScroll: (horizontalScroll: boolean) => void;
    /** `true` if sprite wrap is enabled else `false` */
    spriteWrap: boolean;
    /** Handler to set sprite wrap */
    setSpriteWrap: (wrap: boolean) => void;
}

/**
 * Interface for the Slider sub-component's View props
 */
export interface ISliderProps {
    /** DOM ID for the checkbox input field */
    id: string;
    /** Label for the checkbox */
    label: string;
    /** Minimum value */
    min: number;
    /** Maximum value */
    max: number;
    /** Slider step */
    step: number;
    /** Slider value */
    value: number;
    /** Function to trigger on value change */
    changeHandler: (value: number) => void;
}

/**
 * Interface for the Checkbox sub-component's View props
 */
export interface ICheckboxProps {
    /** DOM ID for the checkbox input field */
    id: string;
    /** Label for the checkbox */
    label: string;
    /** Whether checkbox is checked */
    checked: boolean;
    /** Function to trigger on value change */
    changeHandler: (checked: boolean) => void;
}
