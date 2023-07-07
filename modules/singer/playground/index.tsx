import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import PageVoice from './pages/Voice';

const router = createBrowserRouter([
  {
    path: 'voice',
    element: <PageVoice />,
  },
  {
    path: '/',
    element: <Navigate to="voice" />,
  },
]);

const root = createRoot(document.getElementById('playground-root') as HTMLElement);
root.render(<RouterProvider router={router} />);

