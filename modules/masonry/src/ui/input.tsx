import React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  ref,
  ...props
}: React.ComponentProps<'input'> & { ref?: React.Ref<HTMLInputElement> }) {
  const internalRef = React.useRef<HTMLInputElement>(null);

  const mergedRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    },
    [ref],
  );

  if (type === 'number') {
    return (
      <div className="relative inline-flex w-full items-center" style={props.style}>
        <InputPrimitive
          type="number"
          ref={mergedRef}
          data-slot="input"
          className={cn(
            'border-input file:text-foreground placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            'dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50',
            'dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 appearance-none rounded-lg border',
            'bg-transparent px-2.5 py-1 pr-6 text-base transition-colors outline-none',
            'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:ring-3 md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            className,
          )}
          {...props}
          style={{ width: '100%' }}
        />
        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col gap-0.5">
          <button
            type="button"
            tabIndex={-1}
            className={cn(
              'flex cursor-pointer items-center justify-center text-(--widget-color,currentColor)',
              'transition-transform hover:opacity-70 active:scale-95',
            )}
            onClick={(e) => {
              e.preventDefault();
              if (internalRef.current) {
                internalRef.current.stepUp();
                internalRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 0L10 6H0L5 0Z" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            className={cn(
              'flex cursor-pointer items-center justify-center text-(--widget-color,currentColor)',
              'transition-transform hover:opacity-70 active:scale-95',
            )}
            onClick={(e) => {
              e.preventDefault();
              if (internalRef.current) {
                internalRef.current.stepDown();
                internalRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 6L0 0H10L5 6Z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <InputPrimitive
      type={type}
      ref={ref}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
