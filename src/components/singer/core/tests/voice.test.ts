/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { Voice } from '../voice';

describe('class Voice', () => {
    describe('Validate voice initialization', () => {
        const myVoice = new Voice(null);
        test('voice expect beats per minute to be 90 ', () => {
            expect(myVoice.beatsPerMinute).toEqual(90);
	});

        test('voice play note 392, 1, piano ', () => {
            myVoice.playNotes([392], 1, "piano", 0, true);
            expect(myVoice.numberOfNotesPlayed()).toEqual(1);
        });

        test('voice expect number of notes played in seconds to be 2.67', () => {
            expect(Number(myVoice.numberOfNotesPlayedInSeconds.toFixed(2))).toEqual(2.67);
        });

        test('voice play g4, 1/4, "piano" ', () => {
            myVoice.playNote("g4", 1/4, "piano");
            expect(myVoice.numberOfNotesPlayed()).toEqual(2);
        });

        test('voice get beat and measure', () => {
            expect(myVoice.getCurrentBeat()).toEqual(1);
            expect(myVoice.getCurrentMeasure()).toEqual(2);
        });

        test('voice expect number of notes played to be 2', () => {
            expect(Number(myVoice.numberOfNotesPlayedInSeconds.toFixed(2))).toEqual(3.33);
        });

        test('voice play [c4, e4, g4], 1/8, "piano "', () => {
            myVoice.playNotes(["c4", "e4", "g4"], 1/8, "piano", 0, true);
            expect(Number(myVoice.numberOfNotesPlayedInSeconds.toFixed(2))).toEqual(3.67);
        });

        test('voice get beat and measure', () => {
            myVoice.playNotes(["c4", "e4", "g4"], 1/8, "piano", 0, true);
            expect(myVoice.getCurrentBeat()).toEqual(2);
            expect(myVoice.getCurrentMeasure()).toEqual(2);
        });

        test('number of quarter notes played', () => {
            expect(myVoice.getNumberOfNotesPlayedByNoteValue(1 / 4)).toEqual(6);
            expect(myVoice.getNumberOfNotesPlayedByNoteValue(1 / 8)).toEqual(12);
        });

        test('set meter', () => {
            myVoice.setMeter(4, 1/4);
            expect(myVoice.beatsPerMeasure).toEqual(4);
            expect(myVoice.noteValuePerBeat).toEqual(1 / 4);
            expect(myVoice.strongBeats).toEqual([0, 2]);
            expect(myVoice.weakBeats).toEqual([1, 3]);
            expect(myVoice.getCurrentMeasure()).toEqual(2);
            myVoice.setMeter(6, 1/8);
            expect(myVoice.beatsPerMeasure).toEqual(6);
            expect(myVoice.noteValuePerBeat).toEqual(1 / 8);
            expect(myVoice.strongBeats).toEqual([0, 3]);
            expect(myVoice.weakBeats).toEqual([1, 2, 4, 5]);
            myVoice.setStrongBeat(1);
            expect(myVoice.strongBeats).toContain(1);
            expect(myVoice.weakBeats).not.toContain(1);
            expect(myVoice.getCurrentMeasure()).toEqual(2);
        });

        test('measure test', () => {
            myVoice.playNote("g4", 1/4, "piano");
            myVoice.playNote("g4", 1/4, "piano");
            myVoice.playNote("g4", 1/4, "piano");
            expect(myVoice.getCurrentMeasure()).toEqual(3);
            myVoice.playNote("g4", 3/4, "piano");
            expect(myVoice.getCurrentMeasure()).toEqual(4);
            myVoice.playNote("g4", 3/4, "piano");
            expect(myVoice.getCurrentMeasure()).toEqual(5);
            myVoice.playNote("g4", 3/4, "piano");
            expect(myVoice.getCurrentMeasure()).toEqual(6);
        });
    });
});
