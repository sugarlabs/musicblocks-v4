import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import PageBrickFactory from './pages/BrickFactory';
import CollisionPlayGround from './pages/CollisionPlayGround';

const router = createBrowserRouter([
  {
    path: 'factory',
    element: <PageBrickFactory />,
  },
  {
    path: '/',
    element: <Navigate to="factory" />,
  },
  {
    path: '/collision',
    element: <CollisionPlayGround />,
  },
]);

const root = createRoot(document.getElementById('playground-root') as HTMLElement);
root.render(<RouterProvider router={router} />);
