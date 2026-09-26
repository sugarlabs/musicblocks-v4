// Tests for what the help wedge captures of a brick: its name, its help text, and a copy of it to
// draw. What the panel does with them is covered in HelpPanel.test.tsx.

import { afterEach, describe, expect, it } from 'vitest';

import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { useWorkspaceStore } from '@/stores/workspace';

import { brickHelpFor, previewModelOf, titleOf } from './brick-help';

// -------------------------------------------------------------------------------------------------

const colorsDefault = { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' };

afterEach(() => {
    useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
});

/** A "repeat" statement brick with a cavity and one parameter. */
function repeat(tooltipText = 'Repeats the bricks inside it.') {
    return new StatementBrickModel({
        id: 'repeat-1',
        colorsDefault,
        tooltipText,
        widget: { type: 'label', text: 'repeat' },
        params: ['times'],
        hasNesting: true,
        hasConnectionPrev: true,
        hasConnectionNext: true,
    });
}

/** Puts a one-brick tower holding `model` on the canvas. */
function seat(model: StatementBrickModel) {
    useWorkspaceStore.getState().createTower({
        id: `tower-${model.id}`,
        root: { kind: 'statement', model, prev: null, next: null, args: [null], nestedNext: null },
        position: { x: 0, y: 0 },
    });
}

// -------------------------------------------------------------------------------------------------

describe('titleOf', () => {
    it("uses a label brick's text", () => {
        expect(titleOf(repeat())).toBe('repeat');
    });

    it('uses the variant a variant brick is set to', () => {
        const model = new ExpressionBrickModel({
            colorsDefault,
            tooltipText: '',
            widget: { type: 'variant', options: ['+', '-'], value: '-' },
            params: ['a', 'b'],
        });

        expect(titleOf(model)).toBe('-');
    });

    it('falls back to "Help" for a brick with no words of its own', () => {
        const model = new ValueBrickModel({
            colorsDefault,
            tooltipText: '',
            widget: { type: 'numberbox', value: 4 },
        });

        expect(titleOf(model)).toBe('Help');
    });
});

describe('previewModelOf', () => {
    it('copies the brick into a new model with a new id', () => {
        const live = repeat();
        const copy = previewModelOf(live);

        expect(copy).not.toBe(live);
        expect(copy.id).not.toBe(live.id);
        expect(copy.kind).toBe('statement');
        expect((copy as StatementBrickModel).hasNesting).toBe(true);
        expect((copy as StatementBrickModel).params).toEqual(['times']);
    });

    it("does not share the brick's widget, which the live brick may still change", () => {
        const live = repeat();
        const copy = previewModelOf(live);

        expect(copy.widget).toEqual(live.widget);
        expect(copy.widget).not.toBe(live.widget);
    });

    it('draws its slots empty, whatever the live brick holds', () => {
        const live = repeat();
        live.argDims = [{ w: 200, h: 80 }];

        expect((previewModelOf(live) as StatementBrickModel).argDims).toEqual([null]);
    });
});

describe('brickHelpFor', () => {
    it("captures a brick's name, help text and a copy to draw", () => {
        seat(repeat());

        const help = brickHelpFor('repeat-1');

        expect(help?.title).toBe('repeat');
        expect(help?.text).toBe('Repeats the bricks inside it.');
        expect(help?.preview.id).not.toBe('repeat-1');
    });

    it('has nothing for a brick with no help text', () => {
        seat(repeat(''));

        expect(brickHelpFor('repeat-1')).toBeNull();
    });

    it('has nothing for a brick that is no longer on the canvas', () => {
        expect(brickHelpFor('gone')).toBeNull();
    });
});
