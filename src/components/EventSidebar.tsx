import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import AddEventDialog from '@/components/AddEventDialog';
import ThemeToggle from './ThemeToggle';

interface QRCode {
  id: number;
  description?: string;
  uuid?: string;
}

function EventSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [selected, setSelected] = useState<QRCode | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const username = localStorage.getItem('username') || 'User';
  const name = localStorage.getItem('name') || username;
  const roles = (JSON.parse(localStorage.getItem('roles') || '[]') as {
    name: string;
  }[]).map((r) => r.name);
  const isUser = roles.includes('USER') && !roles.includes('ADMIN');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    window.location.href = '/login';
  }

  const loadCodes = useCallback(() => {
    fetchWithAuth('http://localhost:8080/qrcodes')
      .then((res) => res.json())
      .then((data) => {
        const content = Array.isArray(data) ? data : data.content;
        setCodes(content ?? []);
        if (isUser && (!content || content.length === 0)) {
          setSelected(null);
          localStorage.removeItem('currentEvent');
          navigate('/events');
        }
      })
      .catch(() => {
        setCodes([]);
        if (isUser) {
          setSelected(null);
          localStorage.removeItem('currentEvent');
          navigate('/events');
        }
      });
  }, [isUser, navigate]);

  useEffect(() => {
    loadCodes();
    const stored = localStorage.getItem('currentEvent');
    if (stored) {
      try {
        setSelected(JSON.parse(stored) as QRCode);
      } catch {
        /* ignore */
      }
    }
    function handleCreated(e: Event) {
      const code = (e as CustomEvent<QRCode>).detail;
      setSelected(code);
      localStorage.setItem('currentEvent', JSON.stringify(code));
      loadCodes();
      window.dispatchEvent(new Event('currentEventChanged'));
    }
    function handleCurrentChanged() {
      const storedEvent = localStorage.getItem('currentEvent');
      if (storedEvent) {
        try {
          setSelected(JSON.parse(storedEvent) as QRCode);
        } catch {
          setSelected(null);
        }
      } else {
        setSelected(null);
      }
      loadCodes();
    }
    window.addEventListener('eventCreated', handleCreated as EventListener);
    window.addEventListener('currentEventChanged', handleCurrentChanged);
    return () => {
      window.removeEventListener('eventCreated', handleCreated as EventListener);
      window.removeEventListener('currentEventChanged', handleCurrentChanged);
    };
  }, [loadCodes]);

  return (
    <>
      <aside className="flex h-full w-64 flex-col border-r p-4">
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold h-15">Event</h2>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-medium h-10">
              <span>Current Event</span>
              <NavLink
                to="/events"
                className="text-xs text-muted-foreground hover:underline"
              >
                View All
              </NavLink>
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between overflow-hidden h-12"
                >
                  <span className="truncate">
                    {selected
                      ? selected.description || selected.uuid
                      : 'Select event...'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] max-w-64 p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search event..." />
                  <CommandList>
                    <CommandEmpty>No events found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="create"
                        onSelect={() => {
                          setOpen(false);
                          setCreateOpen(true);
                        }}
                      >
                        Create New Event
                      </CommandItem>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setOpen(false);
                          navigate('/events');
                        }}
                      >
                        View all my events
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      {codes.map((code) => (
                        <CommandItem
                          key={code.id}
                          value={code.description || code.uuid || String(code.id)}
                          onSelect={() => {
                            setSelected(code);
                            localStorage.setItem('currentEvent', JSON.stringify(code));
                            window.dispatchEvent(new Event('currentEventChanged'));
                            setOpen(false);
                            navigate('/event-home');
                          }}
                          className="truncate"
                        >
                          {code.description || code.uuid || code.id}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {selected && (
          <nav className="space-y-2 py-2">
            <NavLink
              to="/event-home"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground h-12',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              Event Home
            </NavLink>
            <NavLink
              to="/photos"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground h-12',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              Photos
            </NavLink>
            <NavLink
              to="/events/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground h-12',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              Event Settings
            </NavLink>
          </nav>
        )}
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
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </aside>
      <AddEventDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

export default EventSidebar;

