import { useEffect, useState, type RefObject } from 'react';

/**
 * Tracks fullscreen state off the real `fullscreenchange` event rather than a local flag, so an
 * exit via Esc (or any other browser control) stays in sync.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
        onChange();
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, [ref]);

    const toggle = () => {
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void ref.current?.requestFullscreen();
        }
    };

    return { isFullscreen, toggle };
}
