import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/lib/api';

interface Role {
  id: number;
  name: string;
}

interface UserForm {
  name: string;
  username: string;
  password: string;
  roleIds: number[];
}

interface UserDetail {
  id: number;
  name: string;
  username: string;
  roles: Role[];
}

interface UserFormPageProps {
  readOnly?: boolean;
}

function UserFormPage({ readOnly = false }: UserFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserForm>({
    name: '',
    username: '',
    password: '',
    roleIds: [],
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleOpen, setRoleOpen] = useState(false);

  useEffect(() => {
    fetchWithAuth('http://localhost:8080/roles?page=0&size=1000')
      .then((res) => res.json())
      .then((data: { content: Role[] }) => setRoles(data.content || []));
    if (id) {
      fetchWithAuth('http://localhost:8080/users?page=0&size=1000')
        .then((res) => res.json())
        .then((data: { content: UserDetail[] }) => {
          const found = (data.content || []).find((u) => u.id === Number(id));
          if (found) {
            setUser({
              name: found.name,
              username: found.username,
              password: '',
              roleIds: (found.roles || []).map((r) => r.id),
            });
          }
        });
    }
  }, [id]);

  function handleChange(
    key: 'name' | 'username' | 'password',
    value: string
  ) {
    setUser((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function toggleRole(id: number) {
    setUser((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(id)
        ? prev.roleIds.filter((rid) => rid !== id)
        : [...prev.roleIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: user.name,
      username: user.username,
      password: user.password,
      roles: user.roleIds.map((rid) => ({ id: rid })),
    };
    await fetchWithAuth(
      id ? `http://localhost:8080/users/${id}` : 'http://localhost:8080/users',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    navigate('/rbac/users');
  }

  const title = id ? (readOnly ? 'User' : 'Edit User') : 'New User';

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/rbac/users">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={user.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={user.username}
            onChange={(e) => handleChange('username', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="roles">Roles</Label>
          <Popover open={roleOpen} onOpenChange={setRoleOpen}>
            <PopoverTrigger asChild>
              <Button
                id="roles"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={roleOpen}
                className="w-full justify-between"
                disabled={readOnly}
              >
                {user.roleIds.length
                  ? roles
                      .filter((r) => user.roleIds.includes(r.id))
                      .map((r) => r.name)
                      .join(', ')
                  : 'Select roles...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            {!readOnly && (
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search role..." />
                  <CommandList>
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {roles.map((r) => (
                        <CommandItem
                          key={r.id}
                          value={r.name}
                          onSelect={() => {
                            toggleRole(r.id);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              user.roleIds.includes(r.id)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {r.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            )}
          </Popover>
        </div>
        {!readOnly && (
          <div className="flex justify-end pt-2 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/rbac/users')}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default UserFormPage;

