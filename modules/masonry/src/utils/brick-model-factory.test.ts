// Unit tests for the shared config → model factory and root tower-node wrapper. Pure model-level
// logic — no DOM, no pointer events — so this runs in the node environment.

import { describe, expect, it } from 'vitest';

import type {
    ExpressionBrickViewProps,
    StatementBrickViewProps,
    ValueBrickViewProps,
} from '@/@types/brick.types';

import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';

import { createBrickModel, wrapAsRootNode } from './brick-model-factory';

// -------------------------------------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------------------------------------

const colorsDefault = { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' };

const valueProps: ValueBrickViewProps = {
    kind: 'value',
    widget: { type: 'numberbox', value: 4 },
    colorsDefault,
    tooltipText: 'a number',
};

const expressionProps: ExpressionBrickViewProps = {
    kind: 'expression',
    widget: { type: 'label', text: 'add' },
    colorsDefault,
    tooltipText: 'adds two numbers',
    paramArgs: [{ param: 'A', argDims: null }, { argDims: { w: 10, h: 5 } }],
};

const statementProps: StatementBrickViewProps = {
    kind: 'statement',
    widget: { type: 'label', text: 'repeat' },
    colorsDefault,
    tooltipText: 'repeats its contents',
    paramArgs: [{ param: 'times', argDims: null }],
    nesting: { dims: null, isFolded: false },
    hasConnectionPrev: true,
    hasConnectionNext: false,
};

// -------------------------------------------------------------------------------------------------

describe('createBrickModel', () => {
    it('builds a ValueBrickModel from value props', () => {
        const model = createBrickModel(valueProps);

        expect(model).toBeInstanceOf(ValueBrickModel);
        expect(model.kind).toBe('value');
        expect(model.tooltipText).toBe('a number');
        expect(model.colorsDefault).toEqual(colorsDefault);
        expect((model as ValueBrickModel).widget).toEqual({ type: 'numberbox', value: 4 });
    });

    it('builds an ExpressionBrickModel with params and argDims mapped from paramArgs', () => {
        const model = createBrickModel(expressionProps) as ExpressionBrickModel;

        expect(model).toBeInstanceOf(ExpressionBrickModel);
        expect(model.kind).toBe('expression');
        // Unlabeled slots map to null params; arg dims carry through per slot.
        expect(model.params).toEqual(['A', null]);
        expect(model.argDims).toEqual([null, { w: 10, h: 5 }]);
    });

    it('builds a StatementBrickModel with nesting and connection flags mapped', () => {
        const model = createBrickModel(statementProps) as StatementBrickModel;

        expect(model).toBeInstanceOf(StatementBrickModel);
        expect(model.kind).toBe('statement');
        expect(model.params).toEqual(['times']);
        expect(model.hasNesting).toBe(true);
        expect(model.isNestingFolded).toBe(false);
        expect(model.hasConnectionPrev).toBe(true);
        expect(model.hasConnectionNext).toBe(false);
    });

    it('marks a statement without a nesting config as having no nesting cavity', () => {
        const model = createBrickModel({ ...statementProps, nesting: undefined });

        expect((model as StatementBrickModel).hasNesting).toBe(false);
    });

    it('uses the given id when one is passed', () => {
        const model = createBrickModel(valueProps, 'entry-1');

        expect(model.id).toBe('entry-1');
    });

    it('generates a fresh unique id per call when the id is omitted', () => {
        const first = createBrickModel(valueProps);
        const second = createBrickModel(valueProps);

        expect(first.id).toBeTruthy();
        expect(second.id).toBeTruthy();
        expect(first.id).not.toBe(second.id);
    });

    it('leaves the scaleLevel default to the model boundary', () => {
        // No `?? 2` in the factory — the model constructor owns the default.
        expect(createBrickModel(valueProps).scaleLevel).toBe(2);
        expect(createBrickModel({ ...valueProps, scaleLevel: 3 }).scaleLevel).toBe(3);
    });
});

// -------------------------------------------------------------------------------------------------

describe('wrapAsRootNode', () => {
    it('wraps a value model as a free-floating value node', () => {
        const model = createBrickModel(valueProps);
        const node = wrapAsRootNode(model);

        expect(node).toEqual({ kind: 'value', model, parent: null });
    });

    it('wraps an expression model with one empty arg slot per param', () => {
        const model = createBrickModel(expressionProps);
        const node = wrapAsRootNode(model);

        expect(node.kind).toBe('expression');
        expect(node.model).toBe(model);
        if (node.kind !== 'expression') return;
        expect(node.parent).toBeNull();
        expect(node.args).toEqual([null, null]);
    });

    it('wraps a statement model with empty pointers and an empty nesting cavity when present', () => {
        const model = createBrickModel(statementProps);
        const node = wrapAsRootNode(model);

        expect(node.kind).toBe('statement');
        if (node.kind !== 'statement') return;
        expect(node.prev).toBeNull();
        expect(node.next).toBeNull();
        expect(node.args).toEqual([null]);
        // The brick structurally has a cavity, so the cavity exists but starts empty.
        expect(node.nestedNext).toBeNull();
    });

    it('leaves nestedNext undefined for a statement without a nesting cavity', () => {
        const model = createBrickModel({ ...statementProps, nesting: undefined });
        const node = wrapAsRootNode(model);

        expect(node.kind).toBe('statement');
        if (node.kind !== 'statement') return;
        expect(node.nestedNext).toBeUndefined();
    });
});
