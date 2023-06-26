import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import PageBrickFactory from './pages/BrickFactory';

const router = createBrowserRouter([
  {
    path: 'factory',
    element: <PageBrickFactory />,
  },
  {
    path: '/',
    element: <Navigate to="factory" />,
  },
]);

const root = createRoot(document.getElementById('playground-root') as HTMLElement);
root.render(<RouterProvider router={router} />);
