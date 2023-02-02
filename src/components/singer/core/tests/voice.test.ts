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
        test('voice', () => {
            expect(myVoice.beatsPerMinute).toEqual(90);
	});

        test('voice', () => {
            myVoice.playNotes([392], 1, "piano", 0, true);
            expect(myVoice.numberOfNotesPlayed()).toEqual(1);
        });

        test('voice', () => {
            expect(myVoice.numberOfNotesPlayedInSeconds.toFixed(2)).toEqual(2.67);
        });

        test('voice', () => {
            myVoice.playNote("g4", 1/4, "piano");
            expect(myVoice.numberOfNotesPlayed()).toEqual(2);
        });

        test('voice', () => {
            expect(myVoice.numberOfNotesPlayedInSeconds.toFixed(2)).toEqual(3.33);
        });

        test('voice', () => {
            myVoice.playNotes(["c4", "e4", "g4"], 1/8, "piano", 0, true);
            expect(myVoice.numberOfNotesPlayedInSeconds.toFixed(2)).toEqual(3.67);
        });
    });
});
