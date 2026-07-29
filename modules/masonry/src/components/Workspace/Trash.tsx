import { Trash2 } from 'lucide-react';
import { useLayoutEffect, useRef, type RefObject } from 'react';

import { useTrashStore } from '@/stores/trash';

interface TrashProps {
  /** The canvas the Trash is pinned inside; resizing it moves the Trash without resizing it. */
  canvasRef: RefObject<HTMLElement | null>;
}

/**
 * Drop target pinned to the bottom right of the workspace canvas.
 *
 * `pointer-events-none`, like `DragGhost`, so it never swallows the drag of a brick parked
 * underneath it — which also means it can never learn it is hovered from its own events. It
 * publishes its measured rect instead, and `useBrickMove` hit-tests the pointer against it and
 * writes `isHovered` back.
 */
export function Trash({ canvasRef }: TrashProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useTrashStore((state) => state.isHovered);

  useLayoutEffect(() => {
    const el = ref.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const { setBounds } = useTrashStore.getState();

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setBounds({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    };

    // The canvas is observed rather than the Trash itself: the Trash is pinned to the canvas'
    // bottom right corner, so a canvas resize moves it without ever changing its own size.
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    measure();

    return () => {
      observer.disconnect();
      setBounds(null);
    };
  }, [canvasRef]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="workspace-trash"
      className={`pointer-events-none absolute right-6 bottom-6 z-40 flex size-14 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
        isHovered
          ? 'border-destructive bg-destructive/15 text-destructive'
          : 'border-border bg-card text-muted-foreground'
      }`}
    >
      <Trash2 className="size-6" />
    </div>
  );
}

export default Trash;
