import type { DragEvent } from '@interactjs/types';

import interact from 'interactjs';
import { useEffect, useRef } from 'react';
import { SoundProvider, checkAudioPermission, useSound } from 'react-sounds';

import { cn } from '@/lib/utils';

const BOXES = [
  { id: 'box-1', label: 'Box 1', x: 100, y: 100 },
  { id: 'box-2', label: 'Box 2', x: 300, y: 150 },
  { id: 'box-3', label: 'Box 3', x: 500, y: 80 },
  { id: 'box-4', label: 'Box 4', x: 200, y: 300 },
  { id: 'box-5', label: 'Box 5', x: 450, y: 320 },
];

function DragNDropContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // Initialise the CDN sounds
  const { play: playGrab } = useSound('ui/button_soft');
  const { play: playDrop } = useSound('ui/button_soft');

  // interact.js binds its listeners once below (empty dep array), so route
  // playback through a ref instead of calling playGrab/playDrop directly
  const audioHooks = useRef({ playGrab, playDrop });

  useEffect(() => {
    (async () => {
      const status = await checkAudioPermission();
      console.log('Audio Playback Status:', status);
    })();
  }, []);

  // Moves the marker to the target's top-left corner: initial inline left/top
  // (still intact, since drag only ever touches transform) plus the accumulated
  // dx/dy total interact.js has stored on dataset.x/y
  const positionMarker = (target: HTMLElement) => {
    if (!markerRef.current) return;

    const left = (parseFloat(target.style.left) || 0) + (parseFloat(target.dataset.x ?? '0') || 0);
    const top = (parseFloat(target.style.top) || 0) + (parseFloat(target.dataset.y ?? '0') || 0);

    // translate(-100%, -100%) is relative to the marker's own size, so it shifts
    // the marker up-left by exactly its own width/height - its bottom-right corner
    // ends up pointing at (left, top) instead of the marker sitting under the box
    markerRef.current.style.transform = `translate(${left}px, ${top}px) translate(-100%, -100%)`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scope the delegated selector to this container so we don't bind .draggable
    // nodes belonging to other instances of this component (or elsewhere in the DOM)
    const interactable = interact('.draggable', { context: containerRef.current }).draggable({
      // Clamp the box's own rect to its parent's bounds on every move, not just on drop.
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: false,
        }),
      ],
      listeners: {
        start(event: DragEvent) {
          const targetId = event.target.getAttribute('data-id');

          console.log(
            `${targetId} | drag started at:`,
            Number(event.clientX0.toFixed(2)),
            Number(event.clientY0.toFixed(2)),
          );

          // Read through the ref rather than the closed-over playGrab
          audioHooks.current.playGrab();

          if (markerRef.current) markerRef.current.style.display = 'block';
          positionMarker(event.target as HTMLElement);
        },
        move(event: DragEvent) {
          const targetId = event.target.getAttribute('data-id');

          // Math-only delta adjustments (Safe for Canvas Panning & Zooming!)
          const { dx, dy } = event;

          console.log(
            `${targetId} | moved by`,
            'X:',
            Number(dx.toFixed(2)),
            'Y:',
            Number(dy.toFixed(2)),
          );

          // Accumulate position on the DOM node itself (not React state) so each pointermove
          // updates the transform directly instead of triggering a re-render per pixel;
          // dataset.x/y is the running total interact.js expects us to maintain between events
          const target = event.target as HTMLElement;
          const x = (parseFloat(target.dataset.x ?? '0') || 0) + event.dx;
          const y = (parseFloat(target.dataset.y ?? '0') || 0) + event.dy;
          target.style.transform = `translate(${x}px, ${y}px)`;
          target.dataset.x = String(x);
          target.dataset.y = String(y);

          positionMarker(target);
        },
        end(event: DragEvent) {
          const targetId = event.target.getAttribute('data-id');

          console.log(
            `${targetId} | drag ended at:`,
            Number(event.clientX.toFixed(2)),
            Number(event.clientY.toFixed(2)),
          );

          // Same ref indirection as on drag start
          audioHooks.current.playDrop();

          if (markerRef.current) markerRef.current.style.display = 'none';
        },
      },
    });

    return () => {
      interactable.unset();
    };
  }, []);

  return (
    <div className="h-full w-full bg-indigo-100 p-4">
      <div ref={containerRef} className="relative h-full w-full bg-white">
        <div
          ref={markerRef}
          className="pointer-events-none absolute top-0 left-0 h-2 w-2 bg-red-500"
          style={{ display: 'none' }}
        >
          <div className="absolute -top-px -left-px h-1.75 w-1.75 bg-white" />
        </div>
        {BOXES.map((box) => (
          <div
            key={box.id}
            data-id={box.id}
            className={cn(
              'draggable',
              'absolute grid h-15 w-30 touch-none place-items-center rounded-md select-none',
              'cursor-grab! bg-indigo-600 text-white active:cursor-grabbing!',
            )}
            style={{
              left: box.x,
              top: box.y,
            }}
          >
            {box.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DragNDrop() {
  return (
    <SoundProvider>
      <DragNDropContent />
    </SoundProvider>
  );
}
