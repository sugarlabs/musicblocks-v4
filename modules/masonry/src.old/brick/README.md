# Data Model for Bricks

## Data Bricks

### Intrinsic

- `uuid`: unique ID for the brick instance
- `name`: name for internal bookkeeping
- `kind`: argument or instruction
- `type`: data, expression, statement, block
- `label`: display name
- `glyph`: glyph icon
- `dataType`: the type (boolean, number, string, any) of value returned
- `dynamic`: whether label is fixed or is a modifiable value
- `value`: modifiable value
- `input`: modification input (checkbox, number, text box, list of options)

### Style

- `colorBg`: background fill color
- `colorFg`: text color
- `outline`: outline/stroke color
- `scale`: sizing scale factor

### State

- `highlighted`: whether brick is highlighted
- `extent`(G): bounding box dimensions

## Expression Bricks

### Intrinsic

- `uuid`: unique ID for the brick instance
- `name`: name for internal bookkeeping
- `kind`: argument or instruction
- `type`: data, expression, statement, block
- `label`: display name
- `glyph`: glyph icon
- `dataType`: type (boolean, number, string, any) of value returned
- `args`: map of argument keys and labels, type, and metadata

### Style

- `colorBg`: background fill color
- `colorFg`: text color
- `outline`: outline/stroke color
- `scale`: sizing scale factor

### State

- `highlighted`: whether brick is highlighted
- `extent`(G): bounding box dimensions
- `argsExtent`: bounding box dimensions for each argument
- `argsCoords`(G): relative coordinates of each argument connection point

## Statement Bricks

### Intrinsic

- `uuid`: unique ID for the brick instance
- `name`: name for internal bookkeeping
- `kind`: argument or instruction
- `type`: data, expression, statement, block
- `label`: display name
- `glyph`: glyph icon
- `args`: map of argument keys and labels, type, and metadata

### Style

- `colorBg`: background fill color
- `colorFg`: text color
- `outline`: outline/stroke color
- `scale`: sizing scale factor
- `connectAbove`: whether connection above brick is allowed
- `connectAbove`: whether connection below brick is allowed

### State

- `highlighted`: whether brick is highlighted
- `extent`(G): bounding box dimensions
- `argsExtent`: bounding box dimensions for each argument
- `argsCoords`(G): relative coordinates of each argument connection point

## Block Bricks

### Intrinsic

- `uuid`: unique ID for the brick instance
- `name`: name for internal bookkeeping
- `kind`: argument or instruction
- `type`: data, expression, statement, block
- `label`: display name
- `glyph`: glyph icon
- `args`: map of argument keys and labels, type, and metadata

### Style

- `colorBg`: background fill color
- `colorFg`: text color
- `outline`: outline/stroke color
- `scale`: sizing scale factor
- `connectAbove`: whether connections above brick is allowed
- `connectAbove`: whether connections below brick is allowed

### State

- `highlighted`: whether brick is highlighted
- `extent`(G): bounding box dimensions
- `argsExtent`: bounding box dimensions for each argument
- `argsCoords`(G): relative coordinates of each argument connection point
- `nestExtent`: bounding box dimensions of child nesting
- `collapsed`: whether or not inner nesting is visible

---

**Note:** Intrinsic and Style properties are set in the constructor and cannot be modified once
instantiated. They are accesible using getters.

**Note:** States marked '(G)' represent getters — values for those will be generated within the
instance and cannot be set from outside.
