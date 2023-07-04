import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import PageCollision from './pages/Collision';

const router = createBrowserRouter([
  {
    path: '/collision',
    element: <PageCollision />,
  },
  {
    path: '/',
    element: <Navigate to="/collision" />,
  },
]);

const root = createRoot(document.getElementById('playground-root') as HTMLElement);
root.render(<RouterProvider router={router} />);
