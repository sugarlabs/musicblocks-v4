import { Voice } from '@/core/voice';
import SynthUtils from '@/core/synthUtils';
import loaders from '@sugarlabs/mb4-assets/src/loaders';
import * as Tone from 'tone';
import { importAssets } from '@sugarlabs/mb4-assets';
import { _state, noteValueToSeconds, _defaultSynth, _polySynth } from '@/singer';

function _getSynth(synthType: String) {
  switch (synthType) {
    case 'polysynth':
      return _polySynth;
  }
  return _defaultSynth;
}

async function playSynth(synthType: String) {
  await Tone.start();
  var synth = _getSynth(synthType);
  _state.notesPlayed = 0;
  console.log('playing c4 using', synthType);
  const now = Tone.now();
  let offset = noteValueToSeconds(_state.notesPlayed);
  synth.triggerAttackRelease('c4', '4n', now + offset);
  _state.notesPlayed += 4;
}

async function voice() {
  var synth = new SynthUtils();
  // const myVoice = new Voice('myvoice', synth);
  // myVoice.playNote('c4', 1 / 4, 'piano');
  synth.trigger(['c4'], 4, 'piano', 3);

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
        <button onClick={async () => {await playSynth('default');}}>Default Synth</button>
        <button onClick={async () => {await playSynth('polysynth');}}>PolySynth</button>
        <button onClick={async () => {await voice();}}>Voice Sample Synth</button>
      </div>
    );
}

