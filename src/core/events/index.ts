import type { TEvent } from '@/@types/core/events';

// -- private variables ----------------------------------------------------------------------------

/** Map of event names and corresponding list of callbacks. */
const _eventTable: Partial<Record<TEvent, CallableFunction[]>> = {};

// -- public functions -----------------------------------------------------------------------------

export function hearEvent(event: 'menu.run', callback: () => unknown): void;
export function hearEvent(event: 'menu.stop', callback: () => unknown): void;
export function hearEvent(event: 'menu.reset', callback: () => unknown): void;
export function hearEvent(event: 'menu.uploadFile', callback: (e: Event) => unknown): void;
export function hearEvent(event: 'menu.startRecording', callback: () => unknown): void;
export function hearEvent(event: 'menu.stopRecording', callback: () => unknown): void;
export function hearEvent(event: 'menu.exportDrawing', callback: () => unknown): void;
export function hearEvent(event: 'menu.loadProject', callback: (e: Event) => unknown): void;
export function hearEvent(event: 'menu.saveProject', callback: () => unknown): void;
/**
 * Adds a callback to an event.
 * @param event event name
 * @param callback callback to be called when the event is emitted
 */
export function hearEvent(event: TEvent, callback: CallableFunction): void {
    if (!(event in _eventTable)) _eventTable[event] = [];

    _eventTable[event]!.push(callback);
}

// -----------------------------------------------------------------------------

export function emitEvent(event: 'menu.run'): void;
export function emitEvent(event: 'menu.stop'): void;
export function emitEvent(event: 'menu.reset'): void;
/**
 * Emits an event.
 * @param event event name
 * @param args arguments to the event callbacks
 */
export function emitEvent(event: TEvent, ...args: unknown[]): void {
    if (!(event in _eventTable) || _eventTable[event]!.length === 0) return;

    _eventTable[event]!.forEach((callback) => callback(...args));
}
