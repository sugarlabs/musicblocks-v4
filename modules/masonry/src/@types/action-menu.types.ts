import type { ComponentType, CSSProperties } from 'react';

/**
 * One wedge of the pie menu: what it is called, what it draws, and what it does to the brick the
 * menu is open on.
 *
 * The action is asked about the brick rather than handed it, because a wedge that would do nothing
 * on this brick is drawn disabled rather than dropped: the ring keeps the same three wedges in the
 * same three places whatever it is opened on, so a wedge is where it was last time.
 */
export interface ActionMenuWedge {
    /** Stable key for the wedge, also what a test reaches for. */
    id: string;
    /** The wedge's accessible name, read out in place of the icon it draws. */
    label: string;
    /** What the wedge does, spelled out for the tooltip that sits under the pointer. */
    tooltip: string;
    /** The icon drawn at the wedge's centre; the menu sizes it and places it over its wedge. */
    Icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>;
    /** Whether the action has anything to do on this brick; a `false` draws the wedge disabled. */
    isEnabled: (brickId: string) => boolean;
    /** Carries the action out on the brick the menu is open on. */
    run: (brickId: string) => void;
}
