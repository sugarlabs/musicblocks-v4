import { Voice } from '@/core/voice';
import SynthUtils from '@/core/synthUtils';
import * as Tone from 'tone';
import { state, noteValueToSeconds, defaultSynth, polySynth } from '@/singer';
import { setupSynthUtils } from '@/core/synthUtils';
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
      return polySynth;
  }
  return defaultSynth;
}

async function playSynth(synthType: string) {
  await Tone.start();
  const synth = _getSynth(synthType);
  state.notesPlayed = 0;
  console.log('playing c4 using', synthType);
  const now = Tone.now();
  let offset = noteValueToSeconds(state.notesPlayed);
  synth.triggerAttackRelease('c4', '4n', now + offset);
  state.notesPlayed += 4;
}

async function voice() {
  const synth = new SynthUtils();
  const myVoice = new Voice('myvoice', synth);

  await setupSynthUtils();

  myVoice.playNote('g4', 1 / 4, 'piano');

  // synth.trigger(['c4', 'g5'], 1/2, 'piano', 0);

  // const sampler = new Tone.Sampler({
  //   urls: {
  //     A1: "A1.mp3",
  //     A2: "A2.mp3",
  //   },
  //   baseUrl: "https://tonejs.github.io/audio/casio/",
  //   onload: () => {
  //     sampler.triggerAttackRelease(["C4", "E4", "G4"], 4, 2);
  //   }
  // }).toDestination();

  // _state.notesPlayed = 0;
  // const now = Tone.now();
  // let offset = noteValueToSeconds(_state.notesPlayed);
  // synth.trigger(['c4', 'd4'], 4, 'electronic synth', now + offset);
  // _state.notesPlayed += 4;
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
