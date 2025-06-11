# Brick Stack

## 1. **Config for Brick Stack**

### (A) Define the Tree Structure Representing a Brick Stack

- **Tree Structure**: A hierarchical representation where each node is a brick.
  - **Nodes**: Represent bricks with unique identifiers (`id`) that link back to their corresponding
  brick model instances.
  - **Chaining of Arguments**: Some bricks will have arguments that connect in a chain-like manner.
  - **Nesting of Instructions**: Instructions can be nested within other instructions.
  - **Shadow Instructions and Arguments**: Handle bricks that act as shadows or placeholders.

### (B) Define the Properties Required to Render the Brick Stack

- **Positioning Information**: Store the relative positions of each brick in the stack to determine
how they are rendered visually.
- **Stack Dimensions**: Overall dimensions based on the size of all bricks combined.

### (C) Define How Connection Points Will Be Mapped

- **Mapping Connection Points**: For any given connection point, identify:
  - Which brick it belongs to.
  - Which part of the brick it represents (e.g., if it's an argument connector, specify which argument).
- **Coordinate Storage**: Store coordinates relative to the origin of the brick stack.

## 2. **Code for Brick Stack**

### **Brick Stack Class (Model)**

This class will encapsulate the functionalities required to manage and render the brick stack. It will
have the following:

- **Methods to Set and Get the Current Tree**:
  - Manage the current state of the tree structure representing the stack.

- **Methods to Query the Map of Connection Points**:
  - Provide a way to retrieve all connection points and their corresponding bricks.

- **Method to Return Props for the React Component (View)**:
  - Gather all properties needed to render the brick stack in the React component based on the current
  state.

### **Brick Stack Positioning Calculations**

The class will also handle:

- **Preorder Traversal for Argument Chains**:
  - Query brick classes (model) to get their bounding boxes.
  - Calculate relative positions of bricks along the argument chains.
  - Determine sizes for argument bricks at different levels of the stack.

- **Preorder Traversal for Instruction Tree**:
  - Query brick models to get their bounding boxes.
  - Calculate relative positions of bricks within the instruction tree.
  - Determine sizes for instruction bricks at different levels of nesting.

- **Mapping of Connection Point Coordinates**:
  - Translate the connection points' coordinates from the brick models to their positions in the stack.

### **React Component for Brick Stack (View)**

- **Props will be (B)**:
  - The component will receive props that include the positioning data and information necessary to
  render the stack correctly.

- **Use the Brick React Components Developed Earlier**:
  - It will utilize the individual brick components (`BrickBlock`, `BrickData`, etc.) that were
  developed earlier.

### **Warehouse Module for Brick Stacks**

- **Map of Brick Stack ID to Instance**:
  - Manage instances of brick stacks using a map structure to keep track of them.

- **Functions to Add, Retrieve, and Delete Instances**:
  - Add a new brick stack, retrieve an existing one, or delete a stack from the warehouse.

## 3. **Storybook Files for Brick Stack Configurations and States**

### **Configurations to Cover:**

- No nesting
- Some nesting
- Deep nesting
- No arguments
- Chain of arguments
- Some missing arguments
- Shadow arguments
- Shadow instructions

## Additional Details and Notes

- **Inline and In-File Documentation**:
  - Ensure that all classes, methods, and complex logic are well-documented to help future contributors
  understand the codebase.

- **Export the Brick Stack Class, React Component, and Warehouse Module**:
  - Make sure these are accessible to the workspace submodule, which will utilize them.

---

What is required of brick

## 1. **Brick Model Classes and Instances**

- **Access to Concrete Classes (`BrickBlock`, `BrickData`, `BrickExpression`, `BrickStatement`)**:
  - Instantiate these classes based on their constructor arguments.
  - Call methods from these classes to get properties like bounding boxes, connection points, and
  render props.

- **Methods to Retrieve Brick States**:
  - Functions like `getBoundingBox()`, `getConnPointsFixed()`, and `getConnPointsArg()` from each
  concrete class to calculate the position and alignment of each brick in the stack.

- **Methods to Set and Update Brick States**:
  - Methods like `setScale()`, `setHighlighted()`, and other setters that allow changing the state of
  bricks dynamically as the stack is manipulated.

## 2. **Brick Factory and Warehouse Functions**

- **Factory Functions** (`createBrickBlock`, `createBrickData`, etc.):
  - These will be used to create new brick instances with the correct properties. The factory functions
  will handle generating UUIDs and initializing instances with the correct configuration.

- **Warehouse Functions** (`addBrickToWarehouse`, `getBrickFromWarehouse`, `deleteBrickFromWarehouse`):
  - To store, retrieve, and manage instances of bricks efficiently. The brick stack needs to interact
  with the warehouse to maintain a map of all brick instances it contains.

## 3. **Type Definitions and Interfaces**

- **Types for Brick Properties and States** (`TBrickRenderProps`, `TColor`, `TExtent`, `TCoords`, etc.):
  - Use these types to ensure consistent typing for the properties and states across both the brick
  stack and brick submodules.

- **Interfaces for Brick Contracts** (`IBrick`, `IBrickBlock`, `IBrickData`, etc.):
  - These will define the contract that each brick type must fulfill. The stack will rely on these
  contracts to interact with different brick instances.

## 4. **Render Properties and Methods**

- **Render Prop Methods** (`renderProps()`):
  - Use the methods from the concrete brick classes to gather all necessary data for rendering each
  brick in the stack. This data will be passed to the React component representing the stack.

## 5. **Bounding Box and Connection Point Calculations**

- **Bounding Box Methods** (`getBoundingBox()`, etc.):
  - Need these to determine the dimensions of each brick and calculate their positions within the stack.

- **Connection Point Methods** (`getConnPointsFixed()`, `getConnPointsArg()`, etc.):
  - These will help manage how bricks connect to each other, especially when considering nested or
  chained configurations.

## 6. **Hooks for State Changes**

- **State Management Hooks**:
  - Hooks or methods that listen to or trigger changes in brick states (e.g., highlight state, scale
  state) so that the stack can re-render or adjust positioning when necessary.

## 7. **Storybook and Test Utilities**

- **Storybook Stories and Test Configurations**:
  - Use the existing stories and test configurations to verify that the stack integrates correctly
  with different brick types and configurations.
