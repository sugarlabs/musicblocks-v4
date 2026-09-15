import { useEffect } from 'react';

import { useActionMenuStore } from '@/stores/actionMenu';
import { ACTION_MENU_SELECTOR } from '@/utils/constants';

/**
 * Closes the action menu on Escape and on a press outside it. The listeners go up only while the
 * menu is open, so the right click that opened it has already been and gone, and `pointerdown` is
 * taken in the capture phase because the fold chevron stops its own.
 */
export function useActionMenuDismiss(): void {
    const isOpen = useActionMenuStore((state) => state.brickId !== null);

    useEffect(() => {
        if (!isOpen) return;

        const close = () => useActionMenuStore.getState().close();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };

        const onPointerDown = (event: Event) => {
            const target = event.target;
            // A press on the menu is the menu's own to handle.
            if (target instanceof Element && target.closest(ACTION_MENU_SELECTOR)) return;

            close();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown, true);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown, true);
        };
    }, [isOpen]);
}
