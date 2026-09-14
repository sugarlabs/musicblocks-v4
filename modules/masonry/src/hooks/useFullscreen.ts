import { useEffect, useState } from 'react';

/**
 * Fullscreen is taken on the page root, not on the workspace element. The app's own chrome (its
 * navigation, toolbars, anything mounted around the workspace) lives outside that element, and a
 * request scoped to it would black out everything else; taking the page root keeps the app intact
 * and drops only the browser's own chrome.
 *
 * State is read off the real `fullscreenchange` event rather than a local flag, so an exit via Esc
 * (or any other browser control) stays in sync.
 */
export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        onChange();
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // Fullscreen is not everywhere: iOS Safari has none outside `<video>`, and a frame embedded
    // without `allow="fullscreen"` has it turned off. Calling through either would throw or be
    // refused, so the control renders away instead of sitting there doing nothing.
    const isSupported =
        typeof document.documentElement.requestFullscreen === 'function' &&
        document.fullscreenEnabled !== false;

    const toggle = () => {
        if (!isSupported) return;

        // A browser turns a request down by rejecting it: no user activation behind the click, a
        // permissions policy, a sandboxed frame. There is nothing to recover, since
        // `fullscreenchange` never fires and the button already reads right, but left unhandled
        // the rejection surfaces as a console error, so it is swallowed here.
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        } else {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    };

    return { isFullscreen, isSupported, toggle };
}
