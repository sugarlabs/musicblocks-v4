/**
 * @vitest-environment jsdom
 */
// Run in jsdom rather than node, the default for unit tests, since autosave listens for pointer
// presses and for the page being hidden or closed. Every history entry is a fresh object, so the
// assertions use `toBe` to pin down exactly which snapshot was written.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExportedProject } from '@/@types/import-export.types';
import { useWorkspaceHistoryStore } from '@/stores/history';

import { AUTOSAVE_DELAY_MS, AUTOSAVE_ID, startAutosave } from './autosave';
import type { ProjectStorage } from './project-storage';

/** Records every save; the other methods are never called by autosave. */
function recordingStorage(save: ProjectStorage['save'] = async () => {}) {
    const saved: ExportedProject[] = [];
    const storage: ProjectStorage = {
        save: vi.fn((id, name, project) => {
            saved.push(project);
            return save(id, name, project);
        }),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
    };
    return { storage, saved };
}

const history = () => useWorkspaceHistoryStore.getState();
const entry = (index: number) => history().history[index];
const current = () => entry(history().currentIndex);

function setVisibility(state: DocumentVisibilityState) {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
    document.dispatchEvent(new Event('visibilitychange'));
}

function pointer(type: 'pointerdown' | 'pointerup', pointerId = 1) {
    window.dispatchEvent(Object.assign(new Event(type), { pointerId }));
}

let stop: (() => void) | undefined;

/** Starts autosave on a freshly mounted workspace. */
function mount(storage: ProjectStorage) {
    stop = startAutosave(storage);
    history().init();
}

beforeEach(() => {
    vi.useFakeTimers();
    history().clear();
});

afterEach(() => {
    stop?.();
    stop = undefined;
    setVisibility('visible');
    window.dispatchEvent(new Event('blur'));
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('startAutosave', () => {
    it('does not save the snapshot taken when the workspace mounts', () => {
        const { storage } = recordingStorage();
        mount(storage);

        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2);

        expect(storage.save).not.toHaveBeenCalled();
    });

    it('saves the latest snapshot once edits pause', () => {
        const { storage, saved } = recordingStorage();
        mount(storage);

        history().commit();
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
        history().commit();
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
        expect(storage.save).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(storage.save).toHaveBeenCalledTimes(1);
        expect(storage.save).toHaveBeenCalledWith(AUTOSAVE_ID, 'Autosave', current());
        expect(saved[0]).toBe(entry(2));
    });

    it('saves the entry undo and redo land on', () => {
        const { storage, saved } = recordingStorage();
        mount(storage);
        history().commit();
        history().commit();
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);

        history().undo();
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
        history().redo();
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);

        expect(saved).toHaveLength(3);
        expect(saved[0]).toBe(entry(2));
        expect(saved[1]).toBe(entry(1));
        expect(saved[2]).toBe(entry(2));
    });

    it('waits while a pointer is held, then saves once it is released', () => {
        const { storage, saved } = recordingStorage();
        mount(storage);
        history().commit();

        pointer('pointerdown');
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 3);
        expect(storage.save).not.toHaveBeenCalled();

        pointer('pointerup');
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
        expect(saved).toHaveLength(1);
        expect(saved[0]).toBe(current());
    });

    it('waits until every held pointer is released', () => {
        const { storage } = recordingStorage();
        mount(storage);
        history().commit();

        pointer('pointerdown', 1);
        pointer('pointerdown', 2);
        pointer('pointerup', 1);
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2);
        expect(storage.save).not.toHaveBeenCalled();

        pointer('pointerup', 2);
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
        expect(storage.save).toHaveBeenCalledTimes(1);
    });

    it('does not stall when a release is never seen, once the window loses focus', () => {
        const { storage } = recordingStorage();
        mount(storage);
        history().commit();
        pointer('pointerdown');

        window.dispatchEvent(new Event('blur'));
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2);

        expect(storage.save).toHaveBeenCalledTimes(1);
    });

    it('saves at once when the page is hidden, even mid-drag, and only once', () => {
        const { storage, saved } = recordingStorage();
        mount(storage);
        history().commit();
        pointer('pointerdown');

        setVisibility('hidden');
        window.dispatchEvent(new Event('pagehide'));
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2);

        expect(saved).toHaveLength(1);
        expect(saved[0]).toBe(current());
    });

    it('does not save early when the page becomes visible', () => {
        const { storage } = recordingStorage();
        mount(storage);
        history().commit();

        setVisibility('visible');
        expect(storage.save).not.toHaveBeenCalled();

        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
        expect(storage.save).toHaveBeenCalledTimes(1);
    });

    it('saves at once when the page is closed', () => {
        const { storage, saved } = recordingStorage();
        mount(storage);
        history().commit();

        window.dispatchEvent(new Event('pagehide'));

        expect(saved).toHaveLength(1);
        expect(saved[0]).toBe(current());
    });

    it('writes nothing on hide or close when there is nothing pending', () => {
        const { storage } = recordingStorage();
        mount(storage);

        setVisibility('hidden');
        window.dispatchEvent(new Event('pagehide'));

        expect(storage.save).not.toHaveBeenCalled();
    });

    it('writes a pending change when stopped, then stops listening', () => {
        const { storage, saved } = recordingStorage();
        mount(storage);
        history().commit();

        stop?.();
        stop = undefined;
        expect(saved).toHaveLength(1);
        expect(saved[0]).toBe(current());

        history().commit();
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
        window.dispatchEvent(new Event('pagehide'));
        expect(storage.save).toHaveBeenCalledTimes(1);
    });

    it('logs a failed save instead of throwing, and keeps saving later edits', async () => {
        const failure = new Error('disk full');
        const { storage } = recordingStorage(
            vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined),
        );
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        mount(storage);

        history().commit();
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
        expect(log).toHaveBeenCalledWith('autosave: failed to save workspace', failure);

        history().commit();
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
        expect(storage.save).toHaveBeenCalledTimes(2);
    });
});
