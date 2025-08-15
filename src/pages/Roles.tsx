import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithAuth('http://localhost:8080/roles?page=0&size=1000')
      .then((res) => res.json())
      .then((data) => setRoles(data.content || []));
  }, []);

  const filtered = roles.filter((r) => {
    return `${r.name} ${(r.permissions || [])
      .map((p) => p.name)
      .join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  async function deleteRole(id: number) {
    await fetchWithAuth(`http://localhost:8080/roles/${id}`, {
      method: 'DELETE',
    });
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex-1 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Role</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search Role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => navigate('/rbac/roles/new')}>+ Role</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow
              key={r.id}
              onClick={() => navigate(`/rbac/roles/${r.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{r.name}</TableCell>
              <TableCell>
                {(r.permissions || []).map((p) => p.name).join(', ')}
              </TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu
                  open={openMenuId === r.id}
                  onOpenChange={(open) => setOpenMenuId(open ? r.id : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/rbac/roles/${r.id}/edit`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog
                      onOpenChange={(open) => {
                        if (!open) setOpenMenuId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete selected Role?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRole(r.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default RolesPage;

