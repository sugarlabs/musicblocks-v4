# Data Model for Stack Tree

## Stack Node

### Intrinsic

- `brick`: reference to the BrickModel (Data, Expression, Statement, Block) instance
- `children`: array of child StackNode instances

### Methods

- `constructor(brick: BrickModelData | BrickModelExpression | BrickModelStatement |BrickModelBlock)`
: Initializes a StackNode with the given brick and an empty children array.

## Stack

### - Intrinsic

- `id`: unique ID for the stack instance
- `rootNodes`: array of root StackNode instances
- `_validationDisabled`: private flag to disable validation checks

### - Methods

- `constructor(id: string)`: Initializes a Stack with the given ID and an empty rootNodes array.
- `validate(): boolean`: Validates the stack, returning `true` if there are no validation errors or
if validation is disabled.
- `addNode(node: IStackNode, parentId?: string): void`: Adds a node to the stack. If `parentId` is
provided, the node is added as a child of the specified parent node.
- `removeNode(id: string): void`: Removes a node from the stack by its ID.
- `moveNode(id: string, newParentId: string, newIndex: number): void`: Moves a node to a new parent
 node at the specified index.
- `collapse(id: string): void`: Collapses a block node, hiding its children.
- `expand(id: string): void`: Expands a block node, showing its children.
- `getValidationErrors(): string[]`: Returns an array of validation error messages.
- `disableValidation(): void`: Disables validation checks.
- `enableValidation(): void`: Enables validation checks.

### Private Methods

- `findNode(id: string): IStackNode | null`: Finds a node by its ID.
- `updateNestExtent(node: IStackNode): void`: Updates the nesting extent of a block node based on
 its children.
- `isValidConnection(node: IStackNode, position: 'above' | 'below'): boolean`: Checks if a connection
at the specified position is valid for the given node.

## Factory Function

### -Methods

- `createStackNode(brick: BrickModelData | BrickModelExpression | BrickModelStatement |
BrickModelBlock): IStackNode`: Creates a StackNode based on the given brick type.

---

**Note:** Intrinsic properties are set in the constructor and cannot be modified once instantiated.
They are accessible using getters.

**Note:** Private methods are for internal use within the Stack class and should not be accessed
directly from outside.

---
