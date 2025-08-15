import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';

interface ConnectionFTP {
  id: number;
  enabled: boolean;
  name: string;
  fileProtocol: string;
  hostName: string;
  portNumber: number;
  userName: string;
}

function FTPConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionFTP[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithAuth('http://localhost:8080/ftp-connections')
      .then((res) => res.json())
      .then((data) => setConnections(data));
  }, []);

  const filtered = connections.filter((c) =>
    `${c.enabled} ${c.name} ${c.fileProtocol} ${c.hostName} ${c.portNumber} ${c.userName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function deleteConnection(id: number) {
    await fetchWithAuth(`http://localhost:8080/ftp-connections/${id}`, {
      method: 'DELETE',
    });
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex-1 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>FTP Connections</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>    
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search FTP Connections"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => navigate('/settings/ftp/new')}>+ Connection</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>File Protocol</TableHead>
            <TableHead>Host Name</TableHead>
            <TableHead>Port Number</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Polling Enabled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow
              key={c.id}
              onClick={() => navigate(`/settings/ftp/${c.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.fileProtocol}</TableCell>
              <TableCell>{c.hostName}</TableCell>
              <TableCell>{c.portNumber}</TableCell>
              <TableCell>{c.userName}</TableCell>
              <TableCell>{c.enabled ? 'Yes' : 'No'}</TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu
                  open={openMenuId === c.id}
                  onOpenChange={(open) => setOpenMenuId(open ? c.id : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/settings/ftp/${c.id}/edit`)}
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
                            Delete selected connection?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConnection(c.id)}
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

export default FTPConnectionsPage;
