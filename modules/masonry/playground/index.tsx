import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import WorkSpace from './pages/workspace';

const router = createBrowserRouter([
  {
    path: '/workspace',
    element: <WorkSpace />,
  },
  {
    path: '/',
    element: <Navigate to="/workspace" />,
  },
]);

const root = createRoot(document.getElementById('playground-root') as HTMLElement);
root.render(<RouterProvider router={router} />);
