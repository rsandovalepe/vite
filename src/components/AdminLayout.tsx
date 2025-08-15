import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import SiteHeader from '@/components/SiteHeader';

function AdminLayout() {
  const roles = (JSON.parse(localStorage.getItem('roles') || '[]') as {
    name: string;
  }[]).map((r) => r.name);
  const isAdmin = roles.includes('ADMIN');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdmin) {
    return <Outlet />;
  }

  return (
    <div className="flex h-full">
      {sidebarOpen && <AdminSidebar />}
      <div className="flex-1 p-4">
        <SiteHeader onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;

