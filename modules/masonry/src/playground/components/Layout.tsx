import { Outlet } from 'react-router-dom';

import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
