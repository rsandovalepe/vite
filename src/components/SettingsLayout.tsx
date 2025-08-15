import { Outlet } from 'react-router-dom';
import EventLayout from '@/components/EventLayout';

function SettingsLayout() {
  const roles = (JSON.parse(localStorage.getItem('roles') || '[]') as {
    name: string;
  }[]).map((r) => r.name);
  const isAdmin = roles.includes('ADMIN');

  if (isAdmin) {
    return <Outlet />;
  }

  return (
    <EventLayout>
      <Outlet />
    </EventLayout>
  );
}

export default SettingsLayout;
