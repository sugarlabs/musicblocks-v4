# Processes for Data Flow Diagram

## Level 0: Masonry Framework Communication with MusicBlocks

1. **Load Configuration**:
   - Input: Configuration File
   - Output: Initialized System

2. **Save Configuration**:
   - Input: Current State
   - Output: Updated Configuration File

3. **Generate Syntax Tree**:
   - Input: Brick Stack Data
   - Output: Syntax Tree

4. **Parse Syntax Tree**:
   - Input: Syntax Tree
   - Output: Executable Actions

## Level 1: Interaction between Brick, Palette, Workspace, and Stack of Bricks

### Bricks

1. **Initialize Brick**:
   - Input: Brick Properties
   - Output: Initialized Brick

2. **Provide Brick Properties**:
   - Input: Brick ID from Workspace
   - Output: Brick Properties to Workspace

### Palette

1. **Load Brick List**:
   - Input: Configuration Settings
   - Output: List of Bricks

2. **Select Brick**:
   - Input: Brick Selection
   - Output: Selected Brick Properties to Workspace
   (How this works is, The palette will have a loaded list of SVGs. When you drag one from palette on
   to the workspace, the brick will be created on the workspace whos id matches to the one in brick)

### Workspace

1. **Add Brick to Workspace**:
   - Input: Brick Properties from Palette
   - Output: Updated Workspace

2. **Update Brick Position**:
   - Input: Brick ID and Position Data
   - Output: Updated Brick Position in Workspace

3. **Connect Bricks**:
   - Input: Brick IDs and Connection Data
   - Output: Updated Brick Stack in Workspace

4. **Disconnect Bricks**:
   - Input: Brick IDs
   - Output: Updated Brick Stack in Workspace

5. **Save Workspace State**:
   - Input: Current Workspace Data
   - Output: Saved Workspace State

### Stack of Bricks

1. **Initialize Stack**:
   - Input: Brick Stack Data
   - Output: Initialized Stack

2. **Provide Stack Properties**:
   - Input: Stack ID from Workspace
   - Output: Stack Properties to Workspace

## Level 2: Detailed Interaction within MVC Architecture

### Model

1. BrickModel:
   - Properties:
     - brickType
     - originalColor
     - hoverColor
     - disconnectedColor
     - executionColor
     - highlightState
     - shape
     - sprites
     - labels
     - inputPorts
     - outputPorts
     - editableTextLabels
   - Methods:
     - setHighlightState(state)
     - updateProperties(properties)
     - updateLabels(labels)
     - updatePorts(inputPorts, outputPorts)
2. StackModel:
   - Properties:
     - connectedBricks
     - startPosition
     - validationRules
     - collapsibleState
   - Methods:
     - addBrick(brick)
     - removeBrick(brick)
     - updateProperties(properties)
     - validateStack()
     - setCollapsibleState(state)
3. PaletteModel:
   - Properties:
     - availableBricks
     - categories
     - searchQuery
     - filters
   - Methods:
     - loadBricks(bricks)
     - updateBrickAvailability(brick, available)
     - categorizeItems(categories)
     - filterItems(filters)
     - searchItems(query)
4. WorkspaceModel:
   - Properties:
     - connectedStacks
     - brickPositions
     - zoomLevel
     - undoRedoStack
   - Methods:
     - addStack(stack)
     - removeStack(stack)
     - updateBrickPosition(brick, position)
     - connectBricks(brick1, brick2)
     - disconnectBricks(brick1, brick2)
     - deleteBrick(brick)
     - zoomIn()
     - zoomOut()
     - undo()
     - redo()

### View

1. BrickView:
   - Methods:
     - renderBrick(brick)
     - updateBrickAppearance(brick)
     - renderInlineTextEditing(brick)
     - renderContextMenu(brick)
2. StackView:
   - Methods:
     - renderStack(stack)
     - updateStackAppearance(stack)
     - renderValidationFeedback(stack)
     - renderCollapsibleState(stack)
3. PaletteView:
   - Methods:
     - renderPalette(palette)
     - updatePaletteAppearance(palette)
     - renderCategories(categories)
     - renderSearchBar(searchQuery)
     - renderFilters(filters)
4. WorkspaceView:
   - Methods:
     - renderWorkspace(workspace)
     - updateWorkspaceAppearance(workspace)
     - handleUserInteractions(interaction)
     - renderZoomControls(zoomLevel)
     - renderUndoRedoButtons(undoRedoStack)

### Controller

1. BrickController:
   - Methods:
     - handleBrickPropertyChange(brick, properties)
     - handleBrickHighlightStateChange(brick, state)
     - handleInlineTextEditing(brick, text)
     - handleContextMenuAction(brick, action)
2. StackController:
   - Methods:
     - handleAddBrick(stack, brick)
     - handleRemoveBrick(stack, brick)
     - handleStackPropertyChange(stack, properties)
     - handleStackValidation(stack)
     - handleCollapsibleStateChange(stack, state)
3. PaletteController:
   - Methods:
     - handleBrickLoad(palette, bricks)
     - handleBrickAvailabilityChange(palette, brick, available)
     - handleCategorization(palette, categories)
     - handleFiltering(palette, filters)
     - handleSearching(palette, query)
4. WorkspaceController:
   - Methods:
     - handleAddStack(workspace, stack)
     - handleRemoveStack(workspace, stack)
     - handleBrickPositionChange(workspace, brick, position)
     - handleBrickConnection(workspace, brick1, brick2)
     - handleBrickDisconnection(workspace, brick1, brick2)
     - handleBrickDeletion(workspace, brick)
     - handleZoomIn(workspace)
     - handleZoomOut(workspace)
     - handleUndo(workspace)
     - handleRedo(workspace)
