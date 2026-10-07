import { Component, type ErrorInfo, type ReactNode } from 'react';

import { findNodeAndTower } from '@/stores/workspace';

interface Props {
  /** ID of the brick whose render subtree this boundary wraps; included in the console error. */
  brickId: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  brickId: string;
}

/**
 * Per-brick error boundary for the workspace canvas.
 *
 * Wraps the rendering subtree of a single brick so that a render error does not propagate up and
 * blank the whole workspace. The failed brick is replaced by a small placeholder, and the error is
 * logged with both the brick ID and the tower it belongs to.
 *
 * Intentionally placed inside TowerBrickView's positioning shell so the fallback inherits the
 * shell's `transform: translate(x, y)` and appears at the correct canvas position.
 */
export class BrickErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, brickId: props.brickId };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.brickId !== state.brickId) {
      return { hasError: false, brickId: props.brickId };
    }
    return null;
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const towerId = findNodeAndTower(this.props.brickId)?.tower.id ?? '';
    console.error(
      `[BrickErrorBoundary] Brick "${this.props.brickId}" in tower "${towerId}" threw during render.`,
      error,
      info,
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          aria-label="Brick failed to render"
          data-testid="brick-error-fallback"
          data-brick-id={this.props.brickId}
          className="border-destructive/60 bg-destructive/10 text-destructive/80 flex h-8 min-w-16 items-center justify-center rounded border border-dashed px-2 text-xs select-none"
        >
          !
        </div>
      );
    }

    return this.props.children;
  }
}
