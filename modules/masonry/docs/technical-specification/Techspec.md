# Masonry Framework

## Palette

### Config (Inputs)

- **Categories**:
  - **Attributes**: names, icons
  - **Sections**:
    - **Attributes**: name, icon, color
    - **Bricks**:
      - **Attributes**: id, name, description, thumbnail, BBox

### Search

- **Search text**:
  - Substring match on name
  - Substring match on description
  - Minimum 3 characters

### Drag & Drop

- **For a brick**:
  1. Start drag operation
  2. Transfer brick's logo to workspace
  3. Replace thumbnail with silhouette (silhouette is a grayed-out thumbnail at 50% opacity)

- **Drag Ended**:
  - Replace silhouette with the original thumbnail
  
- **Workspace (WS)**:
  - Handles drag operations
  - Stops drag within the palette
  - Stops drag outside the palette

## Brick

### Brick Types

- **Data Bricks**
  - Returns values
  - Connects only as arguments
  - Example: input
- **Expression Bricks**
  - Returns values
  - Can take 0 or more arguments
  - Connects only as arguments
- **Statement Bricks**
  - Execute actions
  - Connects with other statement/block types
  - Can take 0 or more arguments
- **Block Bricks**
  - Can nest other bricks
  - Connects with other statement/block types
  - Can take 0 or more arguments

### Brick Appearance

- **Attributes**:
  - Color
  - Shape
  - Primary label
  - Any labels (copied)
  - Any connectors

### Brick Interactions

- **Inline Edit**:
  - Only applicable to Data bricks
  - Example: input text

### Brick Structure Overview

- **Brick**:
  - Color
  - Argument connectors
  - Connectors for expression
- **Argument**:
  - Can connect to data bricks
- **Data**:
  - Inputs, labels, nodes
- **Expression**:
  - Contains data bricks
- **Statement**:
  - Instructions, connected to block
- **Block**:
  - Can nest other bricks

## Stack

### Stack Validation

- **Visual Feedback**:
  - Indicators show whether brick combinations are valid.
  - Example: A green outline appears for a valid connection, while a red outline indicates an
   invalid connection.
- **Error Indicators**:
  - Provide explanations for incompatible connections to help users troubleshoot.
  - Example: A reddish boundary and error message explain why the connection is invalid.

### Stack Editing

- **Connection Editing**:
  - Options for repositioning, disconnecting, or connecting bricks.
  - Visual indicators show possible connections.
  - Example: Highlight potential connection points when a brick is moved.

### Stack Grouping

- **Collapsible Groups**:
  - Groups can be collapsed or expanded to manage complexity.
  - Example: Users can organize bricks into groups that can be collapsed to reduce visual clutter.
  - Collapsed groups can be moved as a single unit.

## Workspace

### Layout and Interaction

- **Cloning**:
  - Users can easily create copies of bricks for repeated use.
  - Example: Right-click on a brick and select "Duplicate".
- **Scaling and Rotation**:
  - Bricks can be resized and rotated to fit the workspace better.
  - Example: Click and drag corner handles to resize, or use rotation handles to rotate.
- **Undo/Redo**:
  - Users can revert or reapply changes to their stacks.
  - Example: Undo the last action with Ctrl+Z, redo with Ctrl+Y.
- **Deletion of Bricks**:
  - Users can remove or delete bricks.
  - Example: Drag a brick to the trash icon or press the delete key.

### Data Flow and Interaction

#### Adding Bricks

- **From Palette to Workspace**:
  1. User drags a brick from the palette.
  2. Workspace detects the drag operation and shows a drop area.
  3. User drops the brick in the workspace.
  4. Workspace creates a new brick instance at the drop location.

#### Connecting Bricks

- **Within Workspace**:
  1. User selects a connection point on a brick.
  2. User drags to another brick's connection point.
  3. Workspace validates the connection.
  4. If valid, a connection is established and visual feedback is provided.
  5. If invalid, an error message is shown.

#### Editing Connections

- **Repositioning and Disconnecting**:
  1. User clicks on a connection line.
  2. User can drag the connection to a new point or disconnect it.
  3. Workspace updates the connections and provides visual feedback.

#### Grouping Bricks

- **Creating and Managing Groups**:
  1. User selects multiple bricks.
  2. User groups them into a collapsible unit.
  3. Workspace treats the group as a single entity for movement and scaling.
  4. User can collapse or expand the group to manage workspace complexity.
