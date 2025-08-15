import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { fetchWithAuth } from '@/lib/api';

interface Role {
  name: string;
  permissionIds: number[];
}

interface Permission {
  id: number;
  name: string;
}

interface RoleFormPageProps {
  readOnly?: boolean;
}

function RoleFormPage({ readOnly = false }: RoleFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>({ name: '', permissionIds: [] });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionOpen, setPermissionOpen] = useState(false);

  useEffect(() => {
    fetchWithAuth('http://localhost:8080/permissions')
      .then((res) => res.json())
      .then((data: { content: Permission[] }) =>
        setPermissions(data.content || [])
      );
  }, []);

  useEffect(() => {
    if (id) {
      fetchWithAuth(`http://localhost:8080/roles/${id}`)
        .then((res) => res.json())
        .then((data) =>
          setRole({
            name: data.name,
            permissionIds: (data.permissions || []).map((p: Permission) => p.id),
          })
        );
    }
  }, [id]);

  function handleChange(key: 'name', value: string) {
    setRole((prev) => ({ ...prev, [key]: value }));
  }

  function togglePermission(id: number) {
    setRole((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((pid) => pid !== id)
        : [...prev.permissionIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: role.name,
      permissions: role.permissionIds.map((pid) => ({ id: pid })),
    };
    await fetchWithAuth(
      id ? `http://localhost:8080/roles/${id}` : 'http://localhost:8080/roles',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    navigate('/rbac/roles');
  }

  const title = id ? (readOnly ? 'Role' : 'Edit Role') : 'New Role';

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/rbac/roles">Role</Link>
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
            placeholder="Name"
            value={role.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="permissions">Permissions</Label>
          <Popover open={permissionOpen} onOpenChange={setPermissionOpen}>
            <PopoverTrigger asChild>
              <Button
                id="permissions"
                variant="outline"
                role="combobox"
                aria-expanded={permissionOpen}
                className="w-full justify-between"
                disabled={readOnly}
              >
                {role.permissionIds.length
                  ? permissions
                      .filter((p) => role.permissionIds.includes(p.id))
                      .map((p) => p.name)
                      .join(', ')
                  : 'Select permissions...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            {!readOnly && (
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search permission..." />
                  <CommandList>
                    <CommandEmpty>No permission found.</CommandEmpty>
                    <CommandGroup>
                      {permissions.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.name}
                          onSelect={() => {
                            togglePermission(p.id);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              role.permissionIds.includes(p.id)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {p.name}
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
              onClick={() => navigate('/rbac/roles')}
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

export default RoleFormPage;

