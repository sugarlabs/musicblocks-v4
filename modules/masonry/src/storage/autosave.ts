import type { ExportedProject } from '@/@types/import-export.types';
import { useWorkspaceHistoryStore } from '@/stores/history';

import { IdbProjectStorage } from './idb-storage';
import type { ProjectStorage } from './project-storage';

/** The id the workspace autosaves under, until a project library gives each project its own. */
export const AUTOSAVE_ID = 'autosave';
/** How long edits must pause before the workspace is written. */
export const AUTOSAVE_DELAY_MS = 1500;

// One connection for every mount, rather than a new one each time the workspace remounts.
const defaultStorage = new IdbProjectStorage();

/**
 * Saves the workspace once edits pause, and straight away when the page is hidden or closed.
 *
 * It watches the undo history rather than the towers: each history entry is an `exportWorkspace`
 * snapshot taken after an action has finished, so nothing is serialized twice, and undo and redo
 * are saved too. A save that falls due while a pointer is held down (a drag or a pan) waits until
 * the pointer is released, so nothing is written mid-drag. Hiding or closing the page saves at
 * once, drag or not.
 *
 * The first history entry after none (`init()` on mount, or after `clear()`) is not saved, so
 * opening the app never overwrites the last autosave with an empty workspace. A flow that replaces
 * the workspace should therefore `clear()` then `init()`, and expect the next edit to be saved.
 *
 * shortcut: widget edits reach the history after BrickWidget's own 500ms debounce, so one made in
 * the last 500ms before the page closes is not saved; flush that debounce here if it matters.
 *
 * @returns A function that stops autosaving, writing any pending change first.
 */
export function startAutosave(storage: ProjectStorage = defaultStorage): () => void {
    let pending: ExportedProject | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const pressed = new Set<number>();

    const flush = () => {
        clearTimeout(timer);
        if (!pending) return;
        const project = pending;
        pending = null;
        // shortcut: failures are only logged; showing them to the user comes with the recovery UI.
        storage.save(AUTOSAVE_ID, 'Autosave', project).catch((error: unknown) => {
            console.error('autosave: failed to save workspace', error);
        });
    };

    const saveWhenIdle = () => {
        if (pressed.size > 0) {
            timer = setTimeout(saveWhenIdle, AUTOSAVE_DELAY_MS);
            return;
        }
        flush();
    };

    const unsubscribe = useWorkspaceHistoryStore.subscribe(
        (state) => state.history[state.currentIndex],
        (snapshot, previous) => {
            if (!snapshot || !previous) return;
            pending = snapshot;
            clearTimeout(timer);
            timer = setTimeout(saveWhenIdle, AUTOSAVE_DELAY_MS);
        },
    );

    const press = (event: PointerEvent) => pressed.add(event.pointerId);
    const release = (event: PointerEvent) => pressed.delete(event.pointerId);
    // A release the page never sees (pointer let go outside the window) must not stall saving.
    const releaseAll = () => pressed.clear();
    const flushIfHidden = () => {
        if (document.visibilityState === 'hidden') flush();
    };

    // Capture phase, so a handler that stops propagation cannot hide a press from autosave.
    window.addEventListener('pointerdown', press, true);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', flushIfHidden);
    window.addEventListener('pagehide', flush);

    return () => {
        unsubscribe();
        window.removeEventListener('pointerdown', press, true);
        window.removeEventListener('pointerup', release, true);
        window.removeEventListener('pointercancel', release, true);
        window.removeEventListener('blur', releaseAll);
        document.removeEventListener('visibilitychange', flushIfHidden);
        window.removeEventListener('pagehide', flush);
        flush();
    };
}
