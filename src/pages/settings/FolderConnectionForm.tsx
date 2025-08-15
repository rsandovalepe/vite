import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

interface ConnectionFolder {
  name: string;
  path: string;
  enabled: boolean;
}

interface FolderConnectionFormPageProps {
  readOnly?: boolean;
}

function FolderConnectionFormPage({ readOnly = false }: FolderConnectionFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ConnectionFolder>({
    name: '',
    path: '',
    enabled: true,
  });

  useEffect(() => {
    if (id) {
      fetchWithAuth(`http://localhost:8080/folder-connections/${id}`)
        .then((res) => res.json())
        .then((data) => setConnection(data));
    }
  }, [id]);

  function handleChange(field: keyof ConnectionFolder, value: string | boolean) {
    setConnection((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetchWithAuth(
      id
        ? `http://localhost:8080/folder-connections/${id}`
        : 'http://localhost:8080/folder-connections',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection),
      }
    );
    navigate('/settings/folder');
  }

  async function handleTestPath() {
    const res = await fetchWithAuth('http://localhost:8080/folder-connections/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection),
    });
    if (!res.ok) {
      toast.error('Path is not accessible');
      return;
    }
    const success = await res.json();
    if (success) {
      toast.success('Path is accessible');
    } else {
      toast.error('Path is not accessible');
    }
  }

  const title = id
    ? readOnly
      ? 'Folder Connection'
      : 'Edit Folder Connection'
    : 'New Folder Connection';

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/settings/folder">Folder</Link>
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
            value={connection.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="path">Path</Label>
          <Input
            id="path"
            placeholder="Path"
            value={connection.path}
            onChange={(e) => handleChange('path', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="enabled">Polling Enabled</Label>
          <Select
            value={connection.enabled ? 'yes' : 'no'}
            onValueChange={(value) => handleChange('enabled', value === 'yes')}
            disabled={readOnly}
          >
            <SelectTrigger id="enabled" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end pt-2 space-x-2">
          <Button type="button" variant="secondary" onClick={handleTestPath}>
            Test Path
          </Button>
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/settings/folder')}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default FolderConnectionFormPage;
