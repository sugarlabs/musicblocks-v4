import { useCallback, useRef } from 'react';

import { DRAG_CLICK_SUPPRESSION_MS } from '@/utils/constants';

/** True while a click trailing a drag that ended at `lastDragEnd` should be ignored. */
export function isTrailingDragClick(lastDragEnd: number) {
    return Date.now() - lastDragEnd < DRAG_CLICK_SUPPRESSION_MS;
}

/**
 * Tracks when a drag last ended and reports whether a click trailing it should be ignored.
 *
 * A drag gesture ends with the browser releasing a native click on the element, which would
 * otherwise read as an intentional press. Shared by the palette slot, a workspace brick and a
 * canvas pan so the three cannot drift apart.
 *
 * @returns `markDragEnd` to call from a drag's `end`, and a stable `shouldSuppressClick` predicate.
 */
export function useDragClickSuppression() {
    const lastDragEndRef = useRef(0);

    const markDragEnd = useCallback(() => {
        lastDragEndRef.current = Date.now();
    }, []);

    const shouldSuppressClick = useCallback(() => isTrailingDragClick(lastDragEndRef.current), []);

    return { markDragEnd, shouldSuppressClick };
}
