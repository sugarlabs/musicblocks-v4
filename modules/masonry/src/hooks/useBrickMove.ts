import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import { useBrickLayoutStore } from '@/stores/brick';

/**
 * Attaches interact.js drag events to a brick's DOM element.
 * During a drag, it collects the position delta and updates the target
 * brick's coordinates in the brick layout store, visually translating it.
 *
 * @param id - The unique identifier of the target brick.
 * @param ref - The DOM ref of the brick's wrapper element.
 */
export function useBrickMove(id: string, ref: RefObject<HTMLElement | null>) {
    const dragPosRef = useRef({ x: 0, y: 0 });
    const isMounted = useBrickLayoutStore((state) => state.mounted[id]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const interactable = interact(el).draggable({
            listeners: {
                start(_event: DragEvent) {
                    console.log('Drag started on brick:', id);
                    const { coords } = useBrickLayoutStore.getState();
                    const current = coords[id];
                    if (current) {
                        dragPosRef.current = { x: current.x, y: current.y };
                    }
                },
                move(event: DragEvent) {
                    console.log('Drag move on brick:', id, 'dx:', event.dx, 'dy:', event.dy);
                    dragPosRef.current.x += event.dx;
                    dragPosRef.current.y += event.dy;

                    useBrickLayoutStore.getState().setCoords(id, {
                        x: dragPosRef.current.x,
                        y: dragPosRef.current.y,
                    });
                },
                end(_event: DragEvent) {
                    console.log('Drag ended on brick:', id);
                    // Placeholder for future drop logic
                },
            },
        });

        return () => {
            interactable.unset();
        };
    }, [id, ref, isMounted]);
}
