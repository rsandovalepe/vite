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

function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithAuth('http://localhost:8080/permissions')
      .then((res) => res.json())
      .then((data: { content: Permission[] }) => setPermissions(data.content || []));
  }, []);

  const filtered = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function deletePermission(id: number) {
    await fetchWithAuth(`http://localhost:8080/permissions/${id}`, {
      method: 'DELETE',
    });
    setPermissions((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex-1 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Permission</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search Permission"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => navigate('/rbac/permissions/new')}>
          + Permission
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow
              key={p.id}
              onClick={() => navigate(`/rbac/permissions/${p.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{p.name}</TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu
                  open={openMenuId === p.id}
                  onOpenChange={(open) => setOpenMenuId(open ? p.id : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/rbac/permissions/${p.id}/edit`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog
                      onOpenChange={(open) => {
                        if (!open) setOpenMenuId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete selected Permission?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePermission(p.id)}>
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

export default PermissionsPage;
