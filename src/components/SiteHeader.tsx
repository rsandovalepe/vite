import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'react-router-dom';

interface SiteHeaderProps {
  onToggleSidebar?: () => void;
}

const pathTitles: Record<string, string> = {
  '/event-home': 'Home',
  '/qrcodes': 'QR Codes',
  '/settings/ftp': 'FTP',
  '/settings/folder': 'Folder',
  '/rbac/permissions': 'Permissions',
  '/rbac/roles': 'Roles',
  '/rbac/users': 'Users',
  '/settings/2fa': '2FA',
  '/settings': 'Settings',
};

function SiteHeader({ onToggleSidebar }: SiteHeaderProps) {
  const location = useLocation();
  const title =
    pathTitles[
      Object.keys(pathTitles).find((key) =>
        location.pathname.startsWith(key),
      ) || ''
    ] || 'Home';

  return (
    <header className="mb-4 flex h-14 items-center gap-4 border-b">
      <SidebarTrigger onClick={onToggleSidebar} />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  );
}

export default SiteHeader;
