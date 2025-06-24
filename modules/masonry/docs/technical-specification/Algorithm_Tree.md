# Tower Parsing & Layout Algorithm

This document describes a **stack-based post-order traversal** that computes each brick’s SVG path,
bounding box, and notch‐connection points **after** all of its children have been measured. It
handles arbitrarily deep nesting, distinguishes **expression** vs. **simple** vs. **compound**
bricks, and avoids JavaScript call‐stack limits.

---

## Data Structures

```ts
// Represents one node in the tree (only UUID is needed here)
type TreeNode = {
  uuid: string
}

// Holds the computed metrics for a brick
type Metrics = {
  path: string
  bbox: { w: number; h: number }
  connectionPoints: ConnectionPoints
}

// Frame in our explicit stack
type Frame = {
  node: TreeNode
  visited: boolean
}

// Work‐in‐progress structures
const metricsMap: Map<string, Metrics> = new Map()
const stack: Frame[] = []
```

The model must expose:

```ts
getRoots(): string[]

getBrickType(uuid: string): 'expression' | 'simple' | 'compound'

getExpressionArgs(uuid: string): string[]

getNestedBlocks(uuid: string): string[]

// Optionally for simple/compound
type StatementChildren = { top: string; bottom: string }
getStatementChildren(uuid: string): StatementChildren

getBrickProps(uuid: string): {
  label: string
  type: 'expression' | 'simple' | 'compound'
  strokeWidth: number
  scale: number
  topNotch: boolean
  bottomNotch: boolean
  fontSize: number
}
```

Shared utilities:

```ts
generatePath(config): string
getBoundingBox(config): { w: number; h: number }
deriveNotches(path, bbox): ConnectionPoints
measureLabel(text, fontSize): { w: number; h: number; ascent: number; descent: number }
```

---

## Algorithm Steps

1. **Initialize Work Structures**

   - Empty metrics map

   ```pseudo
   metricsMap ← {}
   stack ← []
   ```

   - Seed roots

   ```pseudo
   for each rootUuid in model.getRoots():
     stack.push({ node: { uuid: rootUuid }, visited: false })
   ```

   We mark `visited = false` on first encounter (“children not yet handled”) and will re-push the
same node with `visited = true` (“ready to compute”) after its children.

2. **Process Frames Until Done**

   ```pseudo
   while stack is not empty:
     (currentNode, visited) ← stack.pop()

     if visited == false:
       // --- First encounter: enqueue children, defer parent ---
       stack.push({ node: currentNode, visited: true })

       // 1) Determine children based on brick type
       type ← model.getBrickType(currentNode.uuid)
       if type == 'expression':
         children ← []
       else if type == 'simple':
         children ← model.getExpressionArgs(currentNode.uuid)
                    + model.getStatementChildren(currentNode.uuid)
       else if type == 'compound':
         children ← model.getNestedBlocks(currentNode.uuid)
                    + model.getExpressionArgs(currentNode.uuid)
                    + model.getStatementChildren(currentNode.uuid)

       // 2) Push children so they come off *before* the parent’s second visit
       for each childUuid in reverse(children):
         stack.push({ node: { uuid: childUuid }, visited: false })

     else:
       // --- Second encounter: all children are ready, compute metrics ---
       // 1) Gather child bounding boxes
       childBBoxes ← []
       for each cUuid in model.getExpressionArgs(currentNode.uuid)
                        + model.getNestedBlocks(currentNode.uuid)
                        + model.getStatementChildren(currentNode.uuid):
         childBBoxes.push(metricsMap[cUuid].bbox)

       // 2) Fetch brick props and measure its label
       props ← model.getBrickProps(currentNode.uuid)
       labelBox ← measureLabel(props.label, props.fontSize)

       // 3) Assemble config
       config = {
         type:        props.type,
         strokeWidth: props.strokeWidth,
         scaleFactor: props.scale,
         bBoxLabel:   { w: labelBox.w, h: labelBox.h },
         bBoxArgs:    childBBoxes,
         hasNotchAbove: props.topNotch,
         hasNotchBelow: props.bottomNotch
       }

       // 4) Compute path, bbox, notch‐coords
       path             ← generatePath(config)
       bbox             ← getBoundingBox(config)
       connectionPoints ← deriveNotches(path, bbox)

       // 5) Store into metricsMap
       metricsMap[currentNode.uuid] = { path, bbox, connectionPoints }
   ```

   **Key invariant**: When a node’s frame is popped with `visited = true`, all of its children (and
their entire subtrees) have already been computed and stored in `metricsMap`.

3. **Completion**

   When the stack empties, `metricsMap` contains the final layout data for every brick:

   - SVG outline (`path`)
   - Dimensions (`bbox`)
   - Notch coordinates (`connectionPoints`)

   You can now feed these into your React components or canvas renderer in a single, child‐first
batch.

---

## Why This Approach

- **Post‐order traversal** ensures each statement/compound block sizes itself around fully measured
plugged‐in bricks.
- **Explicit stack** avoids recursion limits—safe for arbitrary nesting depth.
- **Type‐aware child selection** respects the two “directions” of plug‐ins:
  - Expression bricks never act as parents (no children).
  - Simple bricks only host expression‐slot arguments (and top/bottom chain).
  - Compound bricks first nest entire inner‐blocks, then expression args, then statement chaining.
- **No extra bookkeeping**: the “two‐push visited‐flag” trick implicitly tracks when children are
done without counters or complex state.
