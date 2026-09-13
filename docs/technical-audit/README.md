# Canvas Keyboard Navigation

This document outlines the keyboard navigation bindings, coordinate transformation rules,
focus isolation scoping, and accessibility contracts for the Masonry workspace canvas.

## Key Bindings

The canvas supports non-pointer viewport navigation when focused:

| Key | Modifier | Action | Offset Delta | Description |
| :--- | :--- | :--- | :--- | :--- |
| `ArrowUp` | None | Pan Up | dy = -50px | Moves canvas content upward |
| `ArrowDown` | None | Pan Down | dy = +50px | Moves canvas content downward |
| `ArrowLeft` | None | Pan Left | dx = -50px | Moves canvas content leftward |
| `ArrowRight` | None | Pan Right | dx = +50px | Moves canvas content rightward |
| `ArrowUp` | `Shift` | Fast Pan Up | dy = -100px | Accelerated pan upward |
| `ArrowDown` | `Shift` | Fast Pan Down | dy = +100px | Accelerated pan downward |
| `ArrowLeft` | `Shift` | Fast Pan Left | dx = -100px | Accelerated pan to the left |
| `ArrowRight` | `Shift` | Fast Pan Right | dx = +100px | Accelerated pan to the right |
| `PageUp` | None | Page Up | dy = -300px | Large step upward |
| `PageDown` | None | Page Down | dy = +300px | Large step downward |
| `Home` | None | Reset Pan | (x, y) = (0, 0) | Resets viewport offset back to origin |
| `End` | None | Pan to Extent | Farthest Tower | Pans to encompass active towers |

## Focus Isolation and Scoping Contract

To prevent conflicts with interactive widgets inside bricks or the palette search bar,
the keyboard navigation handler strictly ignores events when the focused element is:

- Standard text or number `<input>` elements (e.g. brick text fields, number boxes).
- Multi-line `<textarea>` elements.
- Native or custom `<select>` triggers and options.
- Editable elements with `contenteditable="true"`.
- Any component carrying `[role="textbox"]`, `[role="searchbox"]`, `[data-slot="input"]`,
  `[data-slot="select-trigger"]`, or `[data-brick-input]`.

When an interactive widget is focused, standard typing, cursor navigation, and text selection
remain uninhibited and `preventDefault()` is not invoked.

## Viewport Coordinate Rules

1. **World Layer Transformation**:
   The canvas houses an inner world layer containing active towers, bricks, and snap preview
   overlays. This layer translates according to `useWorkspaceViewportStore.getState().offset`.
2. **Fixed Viewport HUD**:
   UI controls such as `ScaleControl` (zoom) and `Trash` remain anchored to the viewport
   outside the transformed world container.
3. **Palette Drag and Drop**:
   When dropping a brick from the palette onto the canvas, the drop position is adjusted
   by the current viewport offset (`worldPos = localPos - offset`) so the dropped tower
   lands accurately under the pointer.

## Accessibility

- The canvas element carries `tabIndex={0}` to allow keyboard navigation focus via Tab.
- The canvas specifies semantic role `role="region"` and `aria-label="Workspace Canvas"`.
- A visible focus ring (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset`)
  appears when keyboard focus enters the canvas.
