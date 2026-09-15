import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hover time, in milliseconds, before a brick's tooltip appears. Long enough that a pointer
 * crossing a tower on its way elsewhere does not leave a trail of tooltips behind it.
 */
export const BRICK_TOOLTIP_DELAY_MS = 500;

/**
 * A drag is any gesture with the pointer held down: interact.js drives both palette and tower
 * drags that way, and it works from document level listeners without capturing the pointer, so
 * bricks the pointer crosses mid drag still receive `pointerenter`. Tracking the button here keeps
 * tooltips out of every drag, wherever it started, without a per brick subscription to drag state.
 */
const subscribers = new Set<() => void>();
let pointerIsDown = false;
let isTracking = false;

function handlePointerDown(): void {
    pointerIsDown = true;
    subscribers.forEach((onPointerDown) => onPointerDown());
}

function handlePointerUp(): void {
    pointerIsDown = false;
}

/**
 * Subscribes to the start of a drag. Every brick shares one set of document listeners, attached
 * with the first subscriber and detached with the last.
 *
 * @param onPointerDown - called when a pointer goes down anywhere in the document
 * @returns an unsubscribe function
 */
function subscribeToPointerDown(onPointerDown: () => void): () => void {
    subscribers.add(onPointerDown);

    if (!isTracking) {
        isTracking = true;
        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('pointerup', handlePointerUp, true);
        document.addEventListener('pointercancel', handlePointerUp, true);
    }

    return () => {
        subscribers.delete(onPointerDown);

        if (subscribers.size === 0) {
            isTracking = false;
            pointerIsDown = false;
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('pointerup', handlePointerUp, true);
            document.removeEventListener('pointercancel', handlePointerUp, true);
        }
    };
}

/**
 * Delayed hover tooltip state for a single brick. A drag suppresses the tooltip: one already in
 * flight stops a hover from scheduling one, and one starting while a tooltip is up takes it down.
 *
 * @param tooltipText - the brick's tooltip text; an empty string disables the tooltip
 * @returns `visible` for rendering, with `show` and `hide` for the outline's pointer handlers
 */
export function useBrickTooltip(tooltipText: string): {
    visible: boolean;
    show: () => void;
    hide: () => void;
} {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const hide = useCallback(() => {
        clearTimer();
        setVisible(false);
    }, [clearTimer]);

    const show = useCallback(() => {
        if (tooltipText.length === 0 || pointerIsDown) return;

        clearTimer();
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            setVisible(true);
        }, BRICK_TOOLTIP_DELAY_MS);
    }, [clearTimer, tooltipText]);

    useEffect(() => subscribeToPointerDown(hide), [hide]);

    /** A brick unmounted mid hover must not leave a timer to fire into a dead component. */
    useEffect(() => clearTimer, [clearTimer]);

    return { visible, show, hide };
}
