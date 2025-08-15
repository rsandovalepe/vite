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

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  roles: Role[];
}
function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchWithAuth('http://localhost:8080/users?page=0&size=1000')
      .then((res) => res.json())
      .then((data) => setUsers(data.content || []));
  }, []);

  const filtered = users.filter((u) => {
    const roleNames = u.roles.map((r) => r.name).join(' ');
    return `${u.name} ${u.username} ${roleNames}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  async function deleteUser(id: number) {
    await fetchWithAuth(`http://localhost:8080/users/${id}`, {
      method: 'DELETE',
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="flex-1 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => navigate('/rbac/users/new')}>+ User</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>UserName</TableHead>
            <TableHead>Role Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow
              key={u.id}
              onClick={() => navigate(`/rbac/users/${u.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.roles.map((r) => r.name).join(', ')}</TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu
                  open={openMenuId === u.id}
                  onOpenChange={(open) => setOpenMenuId(open ? u.id : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/rbac/users/${u.id}/edit`)}
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
                            Delete selected user?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser(u.id)}>
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

export default UsersPage;

