import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import EventSidebar from '@/components/EventSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

const pathTitles: Record<string, string> = {
  '/event-home': 'Event Home',
  '/events': 'Events',
  '/photos': 'Photos',
  '/events/settings': 'Event Settings',
  '/settings': 'Settings',
};

function EventLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function ensureCurrentEvent() {
      if (
        !localStorage.getItem('currentEvent') &&
        location.pathname !== '/events' &&
        !location.pathname.startsWith('/settings')
      ) {
        navigate('/events');
      }
    }

    ensureCurrentEvent();
    window.addEventListener('currentEventChanged', ensureCurrentEvent);
    return () =>
      window.removeEventListener('currentEventChanged', ensureCurrentEvent);
  }, [location, navigate]);
  const title =
    pathTitles[
      Object.keys(pathTitles).find((key) =>
        location.pathname.startsWith(key),
      ) || ''
    ] || 'Event Home';

  return (
    <div className="flex h-full">
      {sidebarOpen && <EventSidebar />}
      <div className="flex-1 p-4">
        <header className="mb-4 flex h-14 items-center gap-4 border-b">
          <SidebarTrigger onClick={() => setSidebarOpen((open) => !open)} />
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </header>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}

export default EventLayout;
