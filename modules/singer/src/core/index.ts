/**
 * Public entry for the singer theory core.
 *
 * These classes are self-contained and free of audio or DOM dependencies, so other modules can
 * import them without pulling in Tone or the component layer.
 */
export { default as CurrentPitch } from './currentPitch';
export { default as KeySignature } from './keySignature';
export { default as Temperament } from './temperament';
