import { workspaceTree } from './tree';

// Define BrickNode type to include 'props' and 'children'
type BrickNode = {
  id: string;
  type: string;
  props?: Record<string, any>;
  children: BrickNode[];
};

function renderBrick(node: BrickNode): string {
  switch (node.type) {
    case 'workspace':
      return `<div class="workspace">${node.children.map(renderBrick).join('')}</div>`;
    case 'note':
      return `<div class="brick note">Note: ${node.props?.pitch}, Duration: ${node.props?.duration}</div>`;
    case 'repeat':
      return `<div class="brick repeat">Repeat x${node.props?.times}<div class="repeat-children">${node.children.map(renderBrick).join('')}</div></div>`;
    default:
      return `<div class="brick unknown">Unknown brick type: ${node.type}</div>`;
  }
}

// Render the workspace tree to HTML
const html = `
<html>
<head>
  <style>
    .workspace { padding: 16px; background: #f9f9f9; }
    .brick { margin: 8px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    .note { background: #e0f7fa; }
    .repeat { background: #ffe0b2; }
    .repeat-children { margin-left: 16px; }
  </style>
</head>
<body>
  <h2>Dummy Workspace Renderer</h2>
  ${renderBrick(workspaceTree as BrickNode)}
</body>
</html>
`;

// Write the HTML to a file for preview (Node.js only)
// Print the HTML to the terminal for copy-paste preview
console.log('\n--- BEGIN DUMMY WORKSPACE HTML ---\n');
console.log(html);
console.log('\n--- END DUMMY WORKSPACE HTML ---\n');
