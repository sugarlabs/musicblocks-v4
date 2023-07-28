import { Voice } from '@/core/voice';
import SynthUtils from '@/core/synthUtils';
import {setupSynthUtils} from '@/core/synthUtils';
import * as Tone from 'tone';
import { _state, noteValueToSeconds, _defaultSynth, _polySynth } from '@/singer';

import { injected } from '@/index';

await (async () => {
  const { importAssets, getAsset } = await import('@sugarlabs/mb4-assets');
  const assetManifest = (await import('@sugarlabs/mb4-assets')).default;
  await importAssets(
    Object.entries(assetManifest).map(([identifier, manifest]) => ({ identifier, manifest })),
    () => undefined,
  );

  injected.assets = {
    'audio.guitar': getAsset('audio.guitar')!,
    'audio.piano': getAsset('audio.piano')!,
    'audio.snare': getAsset('audio.snare')!,
  };
})();

function _getSynth(synthType: string) {
  switch (synthType) {
    case 'polysynth':
      return _polySynth;
  }
  return _defaultSynth;
}

async function playSynth(synthType: string) {
  await Tone.start();
  const synth = _getSynth(synthType);
  _state.notesPlayed = 0;
  console.log('playing c4 using', synthType);
  const now = Tone.now();
  let offset = noteValueToSeconds(_state.notesPlayed);
  synth.triggerAttackRelease('c4', '4n', now + offset);
  _state.notesPlayed += 4;
}

async function voice() {
  const synth = new SynthUtils();
  await setupSynthUtils();
  const myVoice = new Voice('myvoice', synth);
  myVoice.playNote('c4', 1 / 4, 'piano');
  // synth.trigger(['c4', 'e4', 'g4'], 1, 'electronic synth', 0);
}

export default function (): JSX.Element {
  return (
    <div>
      <h1>Voice Component</h1>
      <button
        onClick={async () => {
          await playSynth('default');
        }}
      >
        Default Synth
      </button>
      <button
        onClick={async () => {
          await playSynth('polysynth');
        }}
      >
        PolySynth
      </button>
      <button
        onClick={async () => {
          await voice();
        }}
      >
        Voice Sample Synth
      </button>
    </div>
  );
}
