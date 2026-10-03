/**
 * @vitest-environment jsdom
 */
// Tests for what the help wedge captures of a brick: its name, its help text, a copy of it to draw,
// and where it is on screen. What the panel does with them is covered in HelpPanel.test.tsx. Run in
// jsdom rather than node, the default for unit tests, since where the brick is is read off the page.

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TowerStatementNode } from '@/@types/tower.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { useWorkspaceStore } from '@/stores/workspace';

import { brickHelpFor, headOnScreenOf, previewModelOf, titleOf } from './brick-help';

// -------------------------------------------------------------------------------------------------

const colorsDefault = { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' };

afterEach(() => {
    useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

/** A "repeat" statement brick with a cavity and one parameter. */
function repeat(tooltipText = 'Repeats the bricks inside it.', id = 'repeat-1') {
    return new StatementBrickModel({
        id,
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

    it("captures where the brick's head is on screen, for the panel to point at", () => {
        const model = repeat();
        seat(model);
        withHead(model);
        drawOnPage(model.id, { left: 100, top: 50, right: 230 });

        expect(brickHelpFor('repeat-1')?.anchor).toEqual({ x: 100, y: 52, w: 130, h: 24 });
    });
});

/** Gives `model` a head, as its view would once measured. jsdom lays nothing out. */
function withHead(model: StatementBrickModel) {
    vi.spyOn(model, 'bounds', 'get').mockReturnValue({ widget: { x: 4, y: 2, w: 60, h: 24 } });
}

/** Puts an element for a brick on the page, where the canvas would draw it. */
function drawOnPage(id: string, rect: { left: number; top: number; right: number }) {
    const element = document.createElement('div');
    element.dataset.towerBrick = '';
    element.dataset.id = id;
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    document.body.appendChild(element);
}

describe('headOnScreenOf', () => {
    /** A "repeat" holding a number in its slot, with another "repeat" after it. */
    function repeatHoldingANumber(): TowerStatementNode {
        const node: TowerStatementNode = {
            kind: 'statement',
            model: repeat(),
            prev: null,
            next: null,
            args: [],
            nestedNext: null,
        };
        node.args = [
            {
                kind: 'value',
                model: new ValueBrickModel({
                    id: 'number-1',
                    colorsDefault,
                    tooltipText: '',
                    widget: { type: 'label', text: '4' },
                }),
                parent: node,
            },
        ];
        node.next = { ...node, model: repeat(undefined, 'after-1'), args: [null], prev: node };
        withHead(node.model as StatementBrickModel);

        return node;
    }

    it('runs from the brick to the far edge of what it holds in its slots', () => {
        drawOnPage('repeat-1', { left: 300, top: 200, right: 430 });
        drawOnPage('number-1', { left: 400, top: 202, right: 480 });

        expect(headOnScreenOf(repeatHoldingANumber())).toEqual({ x: 300, y: 202, w: 180, h: 24 });
    });

    it('leaves out the bricks after it, however wide', () => {
        drawOnPage('repeat-1', { left: 300, top: 200, right: 430 });
        drawOnPage('after-1', { left: 300, top: 300, right: 900 });

        expect(headOnScreenOf(repeatHoldingANumber())?.w).toBe(130);
    });

    it('is null for a brick that is not on the page', () => {
        expect(headOnScreenOf(repeatHoldingANumber())).toBeNull();
    });
});
