import { useCallback, useEffect, useRef, useState } from 'react';

/** What is keeping a tooltip open: the pointer resting on the trigger, or the keyboard focus. */
export type BrickTooltipTrigger = 'pointer' | 'focus';

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
/**
 * Every pointer currently held down, by id, rather than a single flag: a touch can start a drag
 * and keep it running while a mouse clicks elsewhere, and that mouse's `pointerup` must not
 * declare the drag over. Tooltips stay suppressed until the last pointer lifts.
 */
const activePointerIds = new Set<number>();
let isTracking = false;

/** jsdom and older synthetic events leave `pointerId` out; one id for all of them is enough. */
function idOf(event: Event): number {
    const { pointerId } = event as PointerEvent;
    return typeof pointerId === 'number' ? pointerId : 0;
}

function handlePointerDown(event: Event): void {
    activePointerIds.add(idOf(event));
    subscribers.forEach((onPointerDown) => onPointerDown());
}

function handlePointerUp(event: Event): void {
    activePointerIds.delete(idOf(event));
}

/**
 * A release the document never hears, such as a drag let go outside the browser window, would leave
 * its pointer counted as held and keep every tooltip shut. A pointer seen moving with no button
 * down is plainly not held, so it is let go of then.
 */
function handlePointerMove(event: Event): void {
    if (activePointerIds.size === 0) return;
    if ((event as PointerEvent).buttons === 0) activePointerIds.delete(idOf(event));
}

/**
 * Covers the release a moving pointer cannot report: a touch has no hover, so a missed touch
 * release would otherwise stay held for good. Losing the window's focus ends every gesture in it.
 */
function handleWindowBlur(): void {
    activePointerIds.clear();
}

/**
 * Content that appears on hover or focus has to be dismissible without moving the pointer or the
 * focus (WCAG 1.4.13), so Escape closes every tooltip. It is handled here rather than on a trigger
 * so it also reaches a tooltip opened by hover while the keyboard focus is somewhere else.
 */
function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;

    subscribers.forEach((dismiss) => dismiss());
}

/**
 * A scroll or a resize moves the trigger out from under a tooltip placed at a fixed position, so
 * both close it rather than leave it pointing at where the brick used to be. Closing is preferred
 * over re-measuring: the tooltip renders outside the palette's clipping, so one that followed its
 * brick would float over the canvas once the brick had scrolled out of the palette's view.
 */
function handleLayoutChange(): void {
    subscribers.forEach((dismiss) => dismiss());
}

/**
 * Subscribes to whatever dismisses every tooltip at once: a drag starting, Escape, or a scroll or
 * resize moving the triggers. Every brick shares one set of document listeners, attached with the
 * first subscriber and detached with the last.
 *
 * @param dismiss - called on any of the above
 * @returns an unsubscribe function
 */
function subscribeToDismissal(dismiss: () => void): () => void {
    subscribers.add(dismiss);

    if (!isTracking) {
        isTracking = true;
        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('pointerup', handlePointerUp, true);
        document.addEventListener('pointercancel', handlePointerUp, true);
        document.addEventListener('pointermove', handlePointerMove, {
            capture: true,
            passive: true,
        });
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('keydown', handleKeyDown, true);
        // Scroll does not bubble, so it is caught in the capture phase to hear every scrolling
        // ancestor, the palette's list included, not just the window.
        document.addEventListener('scroll', handleLayoutChange, true);
        window.addEventListener('resize', handleLayoutChange);
    }

    return () => {
        subscribers.delete(dismiss);

        if (subscribers.size === 0) {
            isTracking = false;
            activePointerIds.clear();
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('pointerup', handlePointerUp, true);
            document.removeEventListener('pointercancel', handlePointerUp, true);
            document.removeEventListener('pointermove', handlePointerMove, true);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('scroll', handleLayoutChange, true);
            window.removeEventListener('resize', handleLayoutChange);
        }
    };
}

/**
 * Delayed hover tooltip state for a single brick. A drag suppresses the tooltip: one already in
 * flight stops a hover from scheduling one, and one starting while a tooltip is up takes it down.
 * Escape, a scroll or a resize closes it too, and it stays closed until the pointer or focus
 * arrives afresh.
 *
 * @param tooltipText - the brick's tooltip text; an empty string disables the tooltip
 * @returns the anchor rect to position against, or `null` when closed, plus `show` and `hide` for
 * the outline's pointer handlers
 */
export function useBrickTooltip(tooltipText: string): {
    anchor: DOMRect | null;
    show: (element: Element, trigger?: BrickTooltipTrigger) => void;
    hide: (trigger?: BrickTooltipTrigger) => void;
} {
    const [anchor, setAnchor] = useState<DOMRect | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /**
     * Pointer and focus each hold the tooltip open on their own. A pointer leaving a slot the
     * keyboard is still focused on must not close it, and neither must a blur while the pointer
     * rests on it.
     */
    const activeTriggers = useRef<Set<BrickTooltipTrigger>>(new Set());

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const close = useCallback(() => {
        clearTimer();
        setAnchor(null);
    }, [clearTimer]);

    /**
     * Releases one trigger, or every trigger when called without one, as a drag starting does.
     * The tooltip closes once nothing holds it open.
     */
    const hide = useCallback(
        (trigger?: BrickTooltipTrigger) => {
            if (trigger === undefined) activeTriggers.current.clear();
            else activeTriggers.current.delete(trigger);

            if (activeTriggers.current.size === 0) close();
        },
        [close],
    );

    /**
     * The anchor is measured when the tooltip opens rather than on hover, so a brick that moved
     * during the delay still positions its tooltip correctly.
     */
    const show = useCallback(
        (element: Element, trigger: BrickTooltipTrigger = 'pointer') => {
            activeTriggers.current.add(trigger);

            if (tooltipText.length === 0 || activePointerIds.size > 0) return;

            clearTimer();
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                setAnchor(element.getBoundingClientRect());
            }, BRICK_TOOLTIP_DELAY_MS);
        },
        [clearTimer, tooltipText],
    );

    useEffect(() => subscribeToDismissal(() => hide()), [hide]);

    /** A brick unmounted mid hover must not leave a timer to fire into a dead component. */
    useEffect(() => clearTimer, [clearTimer]);

    return { anchor, show, hide };
}
