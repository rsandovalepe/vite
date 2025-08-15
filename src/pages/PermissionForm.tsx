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
import { fetchWithAuth } from '@/lib/api';

interface Permission {
  name: string;
}

interface PermissionFormPageProps {
  readOnly?: boolean;
}

function PermissionFormPage({ readOnly = false }: PermissionFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [permission, setPermission] = useState<Permission>({ name: '' });

  useEffect(() => {
    if (id) {
      fetchWithAuth(`http://localhost:8080/permissions/${id}`)
        .then((res) => res.json())
        .then((data) => setPermission({ name: data.name }));
    }
  }, [id]);

  function handleChange(value: string) {
    setPermission({ name: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetchWithAuth(
      id
        ? `http://localhost:8080/permissions/${id}`
        : 'http://localhost:8080/permissions',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permission),
      }
    );
    navigate('/rbac/permissions');
  }

  const title = id ? (readOnly ? 'Permission' : 'Edit Permission') : 'New Permission';

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/rbac/permissions">Permission</Link>
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
            value={permission.name}
            onChange={(e) => handleChange(e.target.value)}
            disabled={readOnly}
          />
        </div>
        {!readOnly && (
          <div className="flex justify-end pt-2 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/rbac/permissions')}
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

export default PermissionFormPage;
