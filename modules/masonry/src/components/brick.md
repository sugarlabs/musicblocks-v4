# Brick

The Brick component renders bricks graphically in the visual programming environment — shape,
layout, and ornamentation. Program logic lives outside it.

## Structural Kinds

Every brick is one of three kinds, which determines its connectors and available features.

### Value

A terminal value — a literal, variable, constant, or input widget.

- Has a value-out connector (plugs into a parent's argument slot)
- No sequence connectors
- No param/arg slots
- No nesting cavity

### Expression

A value-producing construct with inputs — an operator, function call, etc.

- Has a value-out connector
- No sequence connectors
- One or more param/arg slot pairs (required)
- No nesting cavity

### Statement

An executable construct in a sequence — an assignment, loop, conditional, block, etc.

- No value-out connector
- Optional sequence-in and sequence-out connectors
- Optional param/arg slot pairs
- Optional nesting cavity; when present, a fold/unfold control is always present

## Connectors

| Connector | Value | Expression | Statement |
| --- | --- | --- | --- |
| Value-out | always | always | never |
| Sequence-in | never | never | optional |
| Sequence-out | never | never | optional |
| Value-in per arg slot | never | implicit | implicit |
| Cavity entry/exit connectors | never | never | implicit when nesting present |

## Primary Slot

Every brick has a primary slot. What can go in it depends on the kind.

**Value** — `label`, `graphic`, `textbox`, `numberbox`, `toggle`, `slider`, or `select`
(picks a runtime value from a fixed set)

**Expression / Statement** — `label`, `graphic`, or `variant` (picks which operational variant
this brick represents, e.g. which math operator or loop type)

Input widgets (`textbox`, `numberbox`, `toggle`, `slider`) are exclusive to value bricks.
`variant` and `select` are distinct: `variant` changes the brick's operational identity,
`select` picks a runtime value.

## Optional Features

- **Glyph** — expression and statement bricks may have a glyph slot alongside the primary slot
- **Switch button** — expression and statement bricks may have a button to swap to an alternate
  brick type *(not yet configurable)*
- **Fold button** — statement bricks with a nesting cavity always have a fold/unfold toggle;
  this is not configurable independently of nesting

## Configuration

The following can be specified per brick instance. Refer to `BrickViewProps` in
`src/@types/brick.d.ts` for the exact shape.

| Property | Applies to | Notes |
| --- | --- | --- |
| Scale level (1–3) | all | Controls size and typography; defaults to 2 |
| Colors (default state) | all | Background, foreground, and border colors |
| Tooltip text | all | Text shown on hover |
| Widget | all | Primary slot content and its current value or text |
| Param/arg dimensions | expression, statement | Bounding box sizes of docked argument bricks |
| Nesting dimensions | statement | Bounding box of nested content; `null` if size is unknown |
| `isFolded` | statement with nesting | Collapses the cavity when true |
| `hasConnectionPrev` / `hasConnectionNext` | statement | Sequence connector flags |
| Glyph dimensions | expression, statement | Omit if no glyph is present |

Highlight colors and shadow are not yet part of the configuration and will be added in a later pass.

### On external dimensions

Argument bricks and nested content are independent bricks rendered separately by the layout
system. The Brick component only receives their bounding box dimensions in order to allocate
the correct amount of space for their slots. It never renders or owns them.

## Path Utility

The SVG outline path is computed by a dedicated geometry utility (`utils/path2.ts`). It operates
purely on dimensions and stroke width, with no knowledge of brick semantics. The Brick component
is responsible for measuring its own content, collecting external dimensions from props, and
passing everything to the utility before composing the final render.
