/**
 * Interface for the Menu component's View props.
 */
export interface IMenuProps {
    /** Menu bar dummy title. */
    title: string;
    /** `true` is auto hide is on else `false`. */
    autoHide: boolean;
    /** Toggles the state of auto hide. */
    toggleAutoHide: () => void;
}

/**
 * Interface for the Menu component's Model class.
 */
export interface IMenuModel {
    /** Whether auto hide is on or off. */
    autoHide: boolean;
    /** Toggles the state of auto hide. */
    toggleAutoHide: () => void;
}
