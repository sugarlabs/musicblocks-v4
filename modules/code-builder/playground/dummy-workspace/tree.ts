// Dummy tree data for the workspace
// Each node represents a brick with type and children
export const workspaceTree = {
  id: 'root',
  type: 'workspace',
  children: [
    {
      id: 'brick-1',
      type: 'note',
      props: { pitch: 'C4', duration: 1 },
      children: []
    },
    {
      id: 'brick-2',
      type: 'repeat',
      props: { times: 4 },
      children: [
        {
          id: 'brick-3',
          type: 'note',
          props: { pitch: 'E4', duration: 0.5 },
          children: []
        },
        {
          id: 'brick-4',
          type: 'note',
          props: { pitch: 'G4', duration: 0.5 },
          children: []
        }
      ]
    }
  ]
};
