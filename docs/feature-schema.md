# Feature Schema – MusicBlocks-v4 

## Overview
This document outlines the features to be implemented in Music Blocks v4 (MBv4). It details brick interactions, user interface enhancements, and implementation strategies.

## Discussion Topics

### Core Requirements for Programs
- Identifying the basic functional needs for MB-v4 programs.

### Bricks: Structure and Interactions

#### Linking and Moving Bricks
- Drag-and-drop functionality will be used for connecting and rearranging bricks.
- Some bricks can connect sequentially, while others require nesting.
- Return statements and certain blocks should not accept connections below them.
- Bricks requiring specific functionalities must be linked to the correct compatible component.

#### Connection Points and Validations
- Bricks have designated connection points:
  - Some handle arguments (incoming/outgoing).
  - Some handle instructions (execution flow).
- Invalid connections must be restricted to prevent logical errors.
- Certain bricks have predefined values and should only accept valid selections.

### User Interaction Enhancements

#### Workspace and Brick Organization
- Users can drag bricks from a structured list into the workspace.
- Right-clicking a brick will open a menu with the following options:
  - Duplicate, Close, Extract, Delete, Help.
- Bottom-right controls include:
  - Fold/unfold workspace content for better visibility.
  - Fold/unfold individual bricks to reduce clutter.
- An auto-arrange feature will be implemented to organize bricks in a structured manner(Home).

#### Visual Customizations
- Bricks will have distinct colors, sizes, and customization options.
- The brick list will be categorized by function.
- Hovering over bricks will highlight them with different colors.
- Some arguments will have labels, while others will not.

### Defining Features and Implementation Strategy

- A comprehensive feature list will be compiled from a user perspective.
- This list will be referred to as "Stories," detailing various user interactions.
- A group of related stories will be categorized as an "Epic," representing a major milestone.

## Next Steps
- Finalize the list of bricks and their properties.
- Create an initial set of Stories to outline user interactions.
- Define the first Epic, grouping key functionalities for structured implementation.
