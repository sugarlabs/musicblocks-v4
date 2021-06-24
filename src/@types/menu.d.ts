/**
 * Interface for the Menu component's View props.
 */
export interface IMenuProps {    
    /** `true` if auto hide is on else `false`. */
    autoHide: boolean;

    /** `true` if auto hide counter is on else `false`. */
    autoHideTemp: boolean;

    /** `true` if play submenu is visible else `false`. */
    playMenuVisible: boolean;

    /** `true` if settings submenu is visible else `false`. */
    settingsMenuVisible: boolean;

    /** `true` if language submenu is visible else `false`. */
    languageMenuVisible: boolean;

    /** list of languages available */
    languages: string[];

    // currLang: string;

    /** Toggles the state of auto hide. */
    toggleAutoHide: () => void;

    /** Toggles the state of auto hide counter. */
    toggleAutoHideTemp: () => void;

    /** Toggles the state of play submenu. */
    togglePlayMenu: () => void;

    /** Toggles the state of settings submenu. */
    toggleSettingsMenu: () => void;

    /** Toggles the state of language submenu. */
    toggleLanguageMenu: () => void;
}

/**
 * Interface for the Menu component's Model class.
 */
export interface IMenuModel {
    /** Whether auto hide is on or off. */
    autoHide: boolean;

    /** Counter to check for auto hide due to difference in z-indices */
    autoHideTemp: boolean;

    /** Whether the Play submenu is open or not */
    playMenuVisible: boolean;

    /** Whether the Settings submenu is open or not */
    settingsMenuVisible: boolean;

    /** Whether the Language submenu is open or not */
    languageMenuVisible: boolean;

    /** Toggles the state of auto hide. */
    toggleAutoHide: () => void;

    /** Toggles the state of auto hide counter. */
    toggleAutoHideTemp: () => void;

    /** Toggles the state of play submenu. */
    togglePlayMenu: () => void;

    /** Toggles the state of settings submenu. */
    toggleSettingsMenu: () => void;

    /** Toggles the state of language submenu. */
    toggleLanguageMenu: () => void;
}
