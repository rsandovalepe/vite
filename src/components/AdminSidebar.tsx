import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

function AdminSidebar() {
  const username = localStorage.getItem('username') || 'User';
  const name = localStorage.getItem('name') || username;

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    window.location.href = '/login';
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r p-4">
      <div className="mb-2 text-sm font-medium">Home</div>
      <nav className="space-y-1">
        <NavLink
          to="/event-home"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/qrcodes"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          QR Codes
        </NavLink>
      </nav>
      <div className="mb-2 mt-4 text-sm font-medium">Connections</div>
      <nav className="space-y-1">
        <NavLink
          to="/settings/ftp"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          FTP
        </NavLink>
        <NavLink
          to="/settings/folder"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          Folder
        </NavLink>
      </nav>
      <div className="mb-2 mt-4 text-sm font-medium">RBAC</div>
      <nav className="space-y-1">
        <NavLink
          to="/rbac/permissions"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          Permissions
        </NavLink>
        <NavLink
          to="/rbac/roles"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          Roles
        </NavLink>
        <NavLink
          to="/rbac/users"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          Users
        </NavLink>
        <NavLink
          to="/settings/2fa"
          className={({ isActive }) =>
            cn(
              'block rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          2FA
        </NavLink>
      </nav>
      <div className="mt-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-2 p-2 text-sm overflow-hidden"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={name}
                />
                <AvatarFallback className="rounded-lg">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate font-medium leading-tight">{name}</span>
                {name && username && name !== username && (
                  <span className="truncate text-xs text-muted-foreground">
                    {username}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="w-[var(--radix-dropdown-menu-trigger-width)] max-w-64"
          >
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export default AdminSidebar;

