# Music Blocks v4 : Masonry Design Document

## Overview

1. **Short Description of the Product**
   - The Masonry (previously called Project Builder) in Music Blocks v4 facilitates graphical brick
   -based music composition, offering various Brick types such as Start, Rhythm, Note, Pitch, and
   Instrument Bricks. Each brick represents a specific functionality, enabling users, especially
   children, to visually create music programs. The Masonry module simplifies the process of
   selecting and arranging bricks to generate music sequences.

2. **Key Features**
   - Enhance the brick library with comprehensive functionalities and render the stack of bricks.
   - Implement collision detection and enhance the user interface for a seamless user experience.
   - Add text to bricks (SVGs) for customization and personalization.
   - Introduce a palette feature, allowing for effortless music composition through intuitive
    drag-and-drop functionality.
   - Integrate Music Blocks v4 with Masonry to streamline music program creation.
   - Address bugs and make overall improvements to enhance the tool's performance and usability.

3. **Main User Activities**
   - Interacting with the bricks using the palette.
   - Composing music using visual programming bricks/stack of bricks.
   - Editing music sequences dynamically.

4. **Subsystems**
   - Palette Subsystem: Manages the palette interface within Music Blocks, providing a selection of
    bricks for users to drag and drop into the workspace.
   - Workspace Subsystem: Controls the workspace area where users can arrange bricks and create
   music compositions.
   - Brick Stack Subsystem: Handles the creation and management of stacks of bricks within the
   workspace, allowing users to combine bricks to form musical sequences.
   - Collision Detection Subsystem: Implements collision detection functionality within the
   workspace, ensuring that bricks interact appropriately to prevent overlapping or conflicting arrangements.

5. **Additional Functionality and Design**
   - Implementation of a MusicBlocks guide button at the top of the interface for user convenience.
   - Integration of a collision detection UI inspired by the Brickly game by Google, enhancing user
    experience and interaction feedback.
   - Optimization of the palette by combining similar types of bricks, reducing clutter and
   improving usability.
   - Enhancement of the search functionality to facilitate easier navigation and selection of bricks
    within the palette.

6. **Purpose**
   - The purpose of this document is to outline the design and architecture of Masonry framework for
    Music Blocks v4

7. **Scope**
   - This document covers the technical details and design considerations of Music Blocks v4,
   including its features and subsystems.

8. **Audience**
   - The intended audience includes developers, contributors, and members involved in the development
   and maintenance of Music Blocks v4.

9. **Definitions and Abbreviations**
   - **Masonry:** The term used to describe the replication and enhancement of the functionality
    related to bricks from the palette, stack of bricks, and other related components of the
    project, aimed at improving their functionality and effectiveness.

    [Screencast from 13-05-24 12:15:30 PM IST.webm](https://github.com/Karan-Palan/musicblocks-v4/assets/143683619/ae9df412-8b3a-4930-8635-ad89da828ba9)

10. **References**

- [Link to Music Blocks v3 project](https://github.com/sugarlabs/musicblocks)
- [Link to Masonry Framework](https://github.com/sugarlabs/musicblocks-v4/tree/develop/modules/code-builder)

## Requirements, Wiki Storages and Docs

1. **Requirements**
   - Functional requirements: Dynamic editing, text addition, UI enhancements, palette feature,
   integration with Music Blocks v4 project.
   - Non-functional requirements: Performance, scalability, maintainability.

2. **Wiki Storages**
   - [Link to project documentation](https://github.com/sugarlabs/musicblocks/blob/master/guide/README.md)

3. **Docs and Responsible Entities**
   - Documentation maintained by project contributors.
   - Responsible entities: Project maintainers, contributors.

4. **Roles, Responsibilities, and Assumptions**
   - Roles: Developers, contributors, project maintainers.
   - Responsibilities: Implementing features, reviewing code, documenting changes.
   - Assumptions: Basic understanding of React, JavaScript/TypeScript, and information about Music
   Blocks software.

## Architecture and Requirements Diagram

To be added

### Design Specification

#### 1. Workspace

- Canvas Area:
  - Large central area for creating and manipulating musical compositions
  - Resizable canvas to accommodate compositions of varying sizes
  - Optional background grid or ruled lines for precise Brick placement

- Grid System:
  - Configurable grid spacing and subdivisions
  - Snap-to-grid functionality for aligning Bricks to grid lines
  - Visual indicators (e.g., dotted lines, highlights) for grid lines and snap points

- Staff Rendering:
  - Multiple staff lines for representing different instruments or voices
  - Customizable staff parameters (number of lines, clef, key signature, time signature)
  - Dynamic staff layout and spacing based on the composition's content

- Brick Connections:
  - Visual representation of connections between Bricks (e.g., lines, curves, bezier paths)
  - Color-coding or highlighting for different connection types or data flows
  - Animated transitions or visual cues when establishing or breaking connections

- Visual Feedback:
  - Error indicators (e.g., red outlines, warning icons) for invalid Brick placements or connections
  - Compatibility indicators (e.g., green highlights) for valid Brick combinations
  - Tooltips or popups for providing additional information or guidance

- Navigation and Viewing:
  - Panning and scrolling functionality for navigating large compositions
  - Zoom controls for adjusting the workspace scale and level of detail
  - Minimap or overview panel for a bird's-eye view of the entire composition

- Workspace Customization:
  - Options to hide or show grid lines, staff lines, or other visual aids
  - Configurable workspace background color or theme
  - Ability to save and load workspace layouts or configurati

#### 2. Palette

- Layout and Organization:
  - Collapsible/expandable categories or sections for different Brick types
  - Customizable order and arrangement of categories
  - Visual separators or dividers between categories

- Brick Previews:
  - Thumbnail or icon previews for each Brick within a category
  - Tooltips or pop-ups displaying Brick names and brief descriptions
  - Color-coding or visual cues for distinguishing different Brick types

- Search and Filtering:
  - Search bar or input field for locating specific Bricks by name or keyword
  - Filter options for narrowing down Bricks based on category, type, or properties
  - Live search results or suggestions as the user types

- Drag and Drop:
  - Ability to drag and drop Bricks from the palette onto the workspace
  - Visual indicators (e.g., ghost preview, outline) for valid drop locations
  - Snap-to-grid or precise positioning when dropping Bricks

- Brick Creation:
  - Options for creating new Bricks or Brick instances directly from the palette
  - Context menus or shortcuts for duplicating or cloning existing Bricks
  - Visual feedback or animations when creating or instantiating new Bricks

- Customization:
  - User-defined categories or custom groupings for organizing Bricks
  - Ability to rename, reorder, or hide/show specific categories
  - Import/export functionality for sharing or backing up custom palette configurations

- Palette Behavior:
  - Dockable or floating palette panel for flexible positioning
  - Resizable palette window or panel for adjusting its size
  - Auto-hide or collapse functionality for maximizing workspace area

#### 3. Bricks

- Shape and Appearance:
  - Distinct geometric shapes (rectangles, circles, hexagons) for different Brick categories
  - Color schemes and palettes for visually differentiating Brick types
  - Textured or patterned backgrounds for certain Brick categories (e.g., control structures)

- Brick Labels and Icons:
  - Clear and concise text labels describing the Brick's function
  - Intuitive icons or symbols representing the Brick's purpose
  - Customizable font styles, sizes, and colors for labels and icons

- Input/Output Ports:
  - Shaped ports or connectors for linking Bricks together
  - Color-coding or visual cues for indicating compatible port types
  - Tooltips or labels explaining the purpose and data type of each port

- Brick Parameters:
  - Editable fields within Bricks for adjusting parameters (e.g., note values, durations)
  - Drop-down menus or selectors for choosing from predefined parameter options
  - Visual indicators like sliders, knobs, or dials for continuous parameter adjustments

- Resizing and Scaling:
  - Resize handles (corners, edges) for adjusting Brick dimensions
  - Proportional scaling or aspect ratio locking options
  - Dynamic scaling of Brick contents (text, icons) during resizing

- Rotation and Flipping:
  - Rotation handles or controls for changing Brick orientation
  - Flip or mirror functionality for reversing Brick placement
  - Snap-to-angle or constrained rotation options (e.g., 90-degree increments)

- Cloning and Duplication:
  - Duplicate or clone functionality for creating copies of existing Bricks
  - Visual previews or ghosted outlines for cloned Brick instances
  - Options for shallow cloning (duplicating the Brick) or deep cloning (including nested Bricks)

- Advanced Editing:
  - Context menus or dedicated editors for advanced Brick customization
  - Visual indicators or badges for displaying Brick metadata (e.g., unique IDs)
  - Color-coding or visual cues for distinguishing different Brick states or modes

#### 4. Brick Connections

- Connection Styles:
  - Various visual styles for rendering connections (straight lines, curves, bezier paths)
  - Customizable line thickness, colors, and patterns for different connection types
  - Animated transitions or visual effects when establishing or breaking connections

- Connection Routing:
  - Automatic routing algorithms for avoiding overlaps and minimizing crossed connections
  - Manual routing options for overriding automatic layouts
  - Visual guides or markers for assisting with precise connection routing

- Connection Labels:
  - Ability to add labels or annotations along connections
  - Customizable label styles (font, color, background) for different connection types
  - Positioning options for labels (centered, aligned to start/end)

- Data Flow Visualization:
  - Visual indicators or animations for showing data flow direction along connections
  - Color-coding or highlighting for different data types or flows
  - Tooltips or pop-ups for displaying data values or previews

- Connection Validation:
  - Visual feedback for valid and invalid connections (e.g., green/red highlights)
  - Error messages or tooltips explaining incompatible connections
  - Ability to temporarily disable validation for advanced use cases

- Connection Editing:
  - Options for rerouting, splitting, or merging connections
  - Context menus or shortcuts for quickly editing connection properties
  - Undo/redo functionality for connection editing operations

- Connection Grouping:
  - Ability to group multiple connections together for better organization
  - Visual boundaries or outlines for defining connection groups
  - Collapsible or expandable groups for managing complexity

#### 5. Collision Detection and Snapping

- Brick Bounding Boxes:
  - Visual representations of Brick bounding boxes or hit areas
  - Configurable padding or margins around Brick boundaries
  - Color-coding or highlighting of bounding boxes for debugging or visualization

- Proximity Detection:
  - Visual indicators or highlights when Bricks are within a specified proximity
  - Adjustable proximity thresholds or ranges for different snapping behaviors
  - Tooltips or pop-ups displaying the current proximity distance

- Snap-to-Grid:
  - Visual guides or markers for grid lines and snap points
  - Configurable grid spacing and subdivision settings
  - Adjustable snapping strength or magnetic attraction to the grid

- Snap-to-Brick:
  - Alignment guides or visual cues for snapping Bricks to other Brick edges or centers
  - Customizable snapping priorities (e.g., snap to centers first, then edges)
  - Temporary visual previews of snapped positions before releasing the Brick

- Snap-to-Connection:
  - Visual indicators or highlights for compatible connection points between Bricks
  - Automatic connection establishment when Bricks are snapped together
  - Animations or visual effects during the snapping and connection process

- Overlap Prevention:
  - Visual feedback or error indicators for overlapping or invalid Brick placements
  - Automatic repositioning or nudging of Bricks to avoid overlaps
  - User-defined rules or constraints for allowing or preventing Brick overlaps

- Snapping Customization:
  - Options to enable or disable specific snapping behaviors (grid, Brick, connection)
  - User-defined snapping preferences or profiles
  - Import/export functionality for sharing custom snapping configurations

#### 6. Brick Editing and Customization

- Inline Editing:
  - Editable text fields within Bricks for modifying labels, values, or parameters
  - Visual indicators or highlights for active inline editing mode
  - Validation and error feedback for invalid inputs or out-of-range values

- Drop-down Menus:
  - Drop-down lists or selectors within Bricks for choosing from predefined options
  - Customizable visual styles (fonts, colors, icons) for drop-down menu items
  - Tooltips or previews for displaying additional information about each option

- Context Menus:
  - Right-click or long-press context menus for accessing Brick-specific actions
  - Hierarchical or nested menus for organizing related actions and options
  - Keyboard shortcuts or mnemonics for quick access to frequently used actions

- Dedicated Editors:
  - Modal dialogs or dedicated panels for advanced Brick customization
  - Visual editing interfaces (e.g., piano roll, rhythm editors) for specialized parameters
  - Undo/redo functionality within dedicated editors for tracking changes

- Undo/Redo Indicators:
  - Visual indicators or badges for displaying the current undo/redo state
  - Animations or visual effects when undoing or redoing Brick editing actions
  - Tooltips or pop-ups showing a preview of the undo/redo operation

#### 7. Musical Notation Rendering

- Notation Styles:
  - Traditional staff notation with notes, rests, and other musical symbols
  - Alternative representations like piano roll, guitar tablature, or custom notations
  - Customizable notation styles (fonts, colors, line spacing) for different instruments

- Real-time Updates:
  - Synchronized updates to the notation as Bricks are added, removed, or modified
  - Smooth transitions or animations when updating the notation
  - Visual indicators or highlights for recently changed or updated notation elements

- Notation Switching:
  - Options or controls for switching between different notation styles or views
  - Visual previews or thumbnails of each notation style for easy identification
  - Customizable keyboard shortcuts or hotkeys for quickly switching notations

- Notation Overlays:
  - Ability to overlay multiple notation styles or representations simultaneously
  - Visual separators or dividers between different notation layers
  - Customizable transparency or opacity settings for each notation layer

- Playback Integration:
  - Synchronized highlighting or animations within the notation during audio playback
  - Visual indicators or markers for the current playback position
  - Customizable playback cursors or beat markers for different notation styles

#### 8. Audio Playback and Visualization

- Playback Controls:
  - Intuitive play, pause, stop, and seek buttons or controls
  - Visual feedback for playback state (playing, paused, stopped)
  - Seek bar or timeline for navigating through the composition

- Audio Visualizations:
  - Synchronized visualizations like piano roll, waveform, or custom graphical representations
  - Configurable visualization styles (colors, themes, rendering modes)
  - Visual indicators or animations synchronized with the audio playback

- Instrument Selection:
  - Visual representations (icons, thumbnails) for different instrument sounds
  - Categorization or grouping of instruments (e.g., by family, genre)
  - Tooltips or previews for auditioning instrument sounds

- Playback Overlays:
  - Ability to overlay multiple visualizations or instrument views simultaneously
  - Visual separators or dividers between different overlay layers
  - Customizable transparency or opacity settings for each overlay layer

#### 9. User Interface and Interactions

- Responsive Layout:
  - Adaptive and responsive design for different screen sizes and resolutions
  - Automatic layout adjustments and reflow for optimal viewing experience
  - Optional full-screen or immersive mode for maximizing workspace area

- Keyboard Shortcuts:
  - Visual indicators or tooltips for available keyboard shortcuts and hotkeys
  - Customizable keyboard shortcut mappings and assignments
  - Conflict resolution or priority handling for overlapping shortcut combinations

- Toolbars and Menus:
  - Configurable toolbars and menus for quick access to frequently used features
  - Customizable toolbar and menu layouts (docking, floating, auto-hide)
  - Visual indicators or badges for displaying tool states or modes

- Themes and Customization:
  - Predefined color themes and visual styles for different preferences
  - Customizable color schemes, font styles, and icon sets
  - Import/export functionality for sharing custom theme configurations

- Accessibility:
  - High-contrast mode or themes for improved visibility
  - Screen reader support and appropriate labeling for accessibility
  - Adjustable font sizes and zoom levels for better readability

---
