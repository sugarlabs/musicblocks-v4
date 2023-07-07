import { ElementStatement, TData } from '@sugarlabs/musicblocks-v4-lib';
import { _stateObj, _defaultSynth, _polySynth, noteValueToSeconds, _state } from '@/singer';
import * as Tone from 'tone';

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

export default function (): JSX.Element {

    return (
      <div>
        <h1>Voice Component</h1>
        <button onClick={async () => {await playSynth('default');}}>Default Synth</button>
        <button onClick={async () => {await playSynth('polysynth');}}>PolySynth</button>
      </div>
    );
}

