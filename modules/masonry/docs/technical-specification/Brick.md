# Brick

## 1. **`model.ts`**: Abstract Classes

This file contains the abstract classes that define the blueprint for different types of bricks.
These classes are not instantiated directly; instead, they are extended by concrete classes to provide
specific implementations.

### Abstract Classes

- **`BrickModel`**: The base class for all brick types.
  - **Properties:**
    - `uuid: string` - Unique identifier.
    - `name: string` - Name for internal bookkeeping.
    - `kind: TBrickKind` - Represents the kind (e.g., "instruction" or "argument").
    - `type: TBrickType` - Represents the type (e.g., "data", "expression", "statement", "block").
    - `label: string` - Primary label for display.
    - `glyph: string` - Optional glyph icon.
    - `colorBg`, `colorFg`, `colorBgHighlight`, `colorFgHighlight`, `outline` - Colors for display.
    - `highlighted: boolean` - State indicating whether the brick is highlighted.
    - `scale: number` - Scale factor for rendering.
  - **Abstract Methods:**
    - `get boundingBox(): TExtent` - Returns the bounding box dimensions of the brick.
    - `get connPointsFixed(): Record<string, { extent: TExtent; coords: TCoords }>` - Returns fixed
    connection points.

- **`BrickModelArgument`**: Extends `BrickModel` for bricks that act as arguments.
  - **Abstract Methods:**
    - `get connPointsFixed(): Record<'argOutgoing', { extent: TExtent; coords: TCoords }>` - Returns
    the outgoing connection point for arguments.

- **`BrickModelInstruction`**: Extends `BrickModel` for instruction bricks.
  - **Properties:**
    - `connectAbove: boolean` - Indicates if the brick can connect above.
    - `connectBelow: boolean` - Indicates if the brick can connect below.
    - `args: { id: string; label: string }[]` - List of arguments.
  - **Abstract Methods:**
    - `get connPointsArg(): { [id: string]: { extent: TExtent; coords: TCoords } }` - Returns connection
    points for arguments.
    - `setBoundingBoxArg(id: string, extent: TExtent): void` - Sets the bounding box for an argument.

- **`BrickModelData`**: Extends `BrickModelArgument` for data bricks.
  - **Properties:**
    - `dynamic: boolean` - Indicates if the data brick is dynamic.
    - `value?: boolean | number | string` - Value of the data brick.
    - `input?: 'boolean' | 'number' | 'string' | 'options'` - Type of input for the data brick.
  - **Abstract Methods:**
    - `get renderProps(): TBrickRenderPropsData` - Returns properties required to render the data brick.

- **`BrickModelExpression`**: Extends `BrickModelArgument` for expression bricks.
  - **Properties:**
    - `args: { id: string; label: string }[]` - List of arguments.
  - **Abstract Methods:**
    - `get connPointsArg(): { [id: string]: { extent: TExtent; coords: TCoords } }` - Returns connection
    points for arguments.
    - `setBoundingBoxArg(id: string, extent: TExtent): void` - Sets the bounding box for an argument.
    - `get renderProps(): TBrickRenderPropsExpression` - Returns properties required to render the
    expression brick.

- **`BrickModelStatement`**: Extends `BrickModelInstruction` for statement bricks.
  - **Abstract Methods:**
    - `get connPointsFixed(): Record<'insTop' | 'insBottom',
    { extent: TExtent; coords: TCoords }>` - Returns fixed connection points for insertion points.
    - `get renderProps(): TBrickRenderPropsStatement` - Returns properties required to render the
    statement brick.

- **`BrickModelBlock`**: Extends `BrickModelInstruction` for block bricks.
  - **Properties:**
    - `folded: boolean` - Indicates if the block brick is folded.
  - **Abstract Methods:**
    - `get connPointsFixed():
    Record<'insTop' | 'insBottom' | 'insNest', { extent: TExtent; coords: TCoords }>` - Returns fixed
    connection points for block insertion.
    - `get renderProps(): TBrickRenderPropsBlock` - Returns properties required to render the block
    brick.
    - `setBoundingBoxNest(extent: TExtent): void` - Sets the bounding box for the nested elements.

## 2. **Concrete Classes**

The concrete classes provide specific implementations of the abstract classes. These classes are used
to create actual brick instances.

- **`BrickBlock.ts`**: Concrete implementation of `BrickModelBlock`.
  - Provides methods to calculate and return bounding boxes (`boundingBox`, `connPointsFixed`), render
  properties (`renderProps`), and set bounding boxes (`setBoundingBoxArg`, `setBoundingBoxNest`).

- **`BrickData.ts`**: Concrete implementation of `BrickModelData`.
  - Implements properties for dynamic data (`dynamic`, `value`, `input`), and methods to get connection
  points (`connPointsFixed`), render properties (`renderProps`), and set various properties (`setDynamic`,
  `setValue`, `setInput`).

- **`BrickExpression.ts`**: Concrete implementation of `BrickModelExpression`.
  - Manages expressions with arguments, implementing methods to calculate argument connection points
  (`connPointsArg`), set bounding boxes (`setBoundingBoxArg`), and provide rendering properties (`renderProps`).

- **`BrickStatement.ts`**: Concrete implementation of `BrickModelStatement`.
  - Converts argument objects to arrays, provides methods for fixed and argument connection points
  (`connPointsFixed`, `connPointsArg`), and rendering properties (`renderProps`).

## 3. **`BrickFactory.ts`: Factory Functions and Warehouse**

This file manages the creation of brick instances and their storage in a warehouse for easy retrieval,
addition, and deletion.

- **Warehouse**: A `Map` to store brick instances keyed by their `uuid`.
  - Functions:
    - `addBrickToWarehouse(brick)`: Adds a brick instance to the warehouse.
    - `getBrickFromWarehouse(id)`: Retrieves a brick by its ID.
    - `deleteBrickFromWarehouse(id)`: Deletes a brick by its ID.

- **Factory Functions**:
  - `createBrickBlock`, `createBrickData`, `createBrickExpression`, `createBrickStatement`: Functions
  that create instances of respective brick types and add them to the warehouse.

## 4. **Components**

Each brick type has a corresponding React component to handle its visual representation. The components
use the `renderProps()` method from the concrete classes to render the brick according to its properties.

- **`BrickWrapper.tsx`**: A Higher-Order Component (HOC) that wraps individual brick components.
  - Retrieves brick instances from the warehouse using factory functions.
  - Passes the `renderProps()` from each brick instance to the specific brick component (`BrickBlock`,
  `BrickData`, `BrickExpression`, `BrickStatement`) for rendering.

## 5. **Stories**

- **Storybook Files**: Used to create stories for each brick type. These files demonstrate different
states and variations of the bricks, using the factory functions to create instances for visualization.
