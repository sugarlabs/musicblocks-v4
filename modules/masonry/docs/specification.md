# Masonry — Specification

Domain model per capability area. Each section covers one piece of the package.

---

## Brick

The Brick component renders bricks graphically in the visual programming environment — shape,
layout, and ornamentation. Program logic lives outside it.

### Structural Kinds

Every brick is one of three kinds, which determines its connectors and available features.

#### Value

A terminal value — a literal, variable, constant, or input widget.

- Has a value-out connector (plugs into a parent's argument slot)
- No sequence connectors
- No param/arg slots
- No nesting cavity

#### Expression

A value-producing construct with inputs — an operator, function call, etc.

- Has a value-out connector
- No sequence connectors
- One or more param/arg slot pairs (required)
- No nesting cavity

#### Statement

An executable construct in a sequence — an assignment, loop, conditional, block, etc.

- No value-out connector
- Optional sequence-in and sequence-out connectors
- Optional param/arg slot pairs
- Optional nesting cavity; when present, a fold/unfold control is always present

### Connectors

| Connector                    | Value  | Expression | Statement                     |
| ---------------------------- | ------ | ---------- | ----------------------------- |
| Value-out                    | always | always     | never                         |
| Sequence-in                  | never  | never      | optional                      |
| Sequence-out                 | never  | never      | optional                      |
| Value-in per arg slot        | never  | implicit   | implicit                      |
| Cavity entry/exit connectors | never  | never      | implicit when nesting present |

### Primary Slot (Widget)

Every brick has a primary slot. What can go in it depends on the kind.

**Value** — `label`, `graphic`, `textbox`, `numberbox`, `toggle`, `slider`, or `select`

**Expression / Statement** — `label`, `graphic`, or `variant` (picks which operational variant
this brick represents, e.g. which math operator or loop type)

Input widgets (`textbox`, `numberbox`, `toggle`, `slider`) are exclusive to value bricks.
`variant` and `select` are distinct: `variant` changes the brick's operational identity,
`select` picks a runtime value.

#### Display widgets (all kinds)

| Type      | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `label`   | Text string identifying the brick; optional icon glyph alongside |
| `graphic` | Static image representing the brick's identity                   |
| `variant` | Dropdown selector for choosing a structural variant of the brick |

#### Input widgets (value kind only)

| Type        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `textbox`   | Freeform text input; optional `maxLength`                    |
| `numberbox` | Numeric input with optional `min`, `max`, `step`             |
| `toggle`    | Boolean on/off switch; optional `on`/`off` state labels      |
| `slider`    | Range slider; `min` and `max` required, `step` defaults to 1 |
| `select`    | Selection from a fixed set of runtime value options          |

### Optional Features

- **Glyph** — expression and statement bricks may have a glyph alongside the primary label
- **Switch button** — expression and statement bricks may have a button to swap to an alternate
  brick type _(not yet implemented)_
- **Fold button** — statement bricks with a nesting cavity always have a fold/unfold toggle;
  this is not configurable independently of nesting

---

## Palette

The catalog of available bricks the user picks from. The config describes what the Palette lists
and how entries are grouped — not how a brick is rendered. Shape: `PaletteConfig` in
`src/@types/palette.types.ts`.

### Structure

A three-level tree: **Category → Section → Brick**.

| Level    | Fields                                           | Role                           |
| -------- | ------------------------------------------------ | ------------------------------ |
| Category | `name`, `icon`, `sections`                       | Top-level group (e.g. "Music") |
| Section  | `name`, `icon`, `color`, `bricks`                | Colored group (e.g. "Pitch")   |
| Brick    | `id`, `name`, `description`, `thumbnail`, `bbox` | A catalog entry                |

A brick entry is a catalog descriptor, not a live brick: `id` keys it to the brick's definition
(resolved to a `BrickModel` on instantiation), `name`/`description` feed listing and search, and
`thumbnail`/`bbox` are the preview. Kind, widgets, connectors, and colors belong to the rendered
brick (`BrickViewProps` / `BrickModel`), not the catalog.
