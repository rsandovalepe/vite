import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

interface ConnectionFTP {
  enabled: boolean;
  name: string;
  fileProtocol: string;
  hostName: string;
  portNumber: number;
  userName: string;
  password: string;
  sshKey: string;
}

interface FTPConnectionFormPageProps {
  readOnly?: boolean;
}

function FTPConnectionFormPage({ readOnly = false }: FTPConnectionFormPageProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ConnectionFTP>({
    enabled: true,
    name: '',
    fileProtocol: '',
    hostName: '',
    portNumber: 0,
    userName: '',
    password: '',
    sshKey: '',
  });

  useEffect(() => {
    if (id) {
      fetchWithAuth(`http://localhost:8080/ftp-connections/${id}`)
        .then((res) => res.json())
        .then((data) =>
          setConnection({
            ...data,
            sshKey: data.sshKey || '',
            name: data.name || '',
            enabled: data.enabled,
          })
        );
    }
  }, [id]);

  function handleChange(field: keyof ConnectionFTP, value: string | number | boolean) {
    setConnection((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetchWithAuth(
      id
        ? `http://localhost:8080/ftp-connections/${id}`
        : 'http://localhost:8080/ftp-connections',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection),
      }
    );
    navigate('/settings/ftp');
  }

  async function handleTestConnection() {
    const res = await fetchWithAuth('http://localhost:8080/ftp-connections/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection),
    });
    if (!res.ok) {
      toast.error('Connection failed');
      return;
    }
    const success = await res.json();
    if (success) {
      toast.success('Connection successful');
    } else {
      toast.error('Connection failed');
    }
  }

  const title = id
    ? readOnly
      ? 'FTP Connection'
      : 'Edit FTP Connection'
    : 'New FTP Connection';

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/settings/ftp">FTP Connections</Link>
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
          <Label htmlFor="fileProtocol">File Protocol</Label>
          <Input
            id="fileProtocol"
            placeholder="File Protocol"
            value={connection.fileProtocol}
            onChange={(e) => handleChange('fileProtocol', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hostName">Host Name</Label>
          <Input
            id="hostName"
            placeholder="Host Name"
            value={connection.hostName}
            onChange={(e) => handleChange('hostName', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portNumber">Port Number</Label>
          <Input
            id="portNumber"
            type="number"
            placeholder="Port Number"
            value={connection.portNumber}
            onChange={(e) => handleChange('portNumber', Number(e.target.value))}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userName">User Name</Label>
          <Input
            id="userName"
            placeholder="User Name"
            value={connection.userName}
            onChange={(e) => handleChange('userName', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={connection.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sshKey">SSH Key</Label>
          <Textarea
            id="sshKey"
            placeholder="SSH Key"
            value={connection.sshKey}
            onChange={(e) => handleChange('sshKey', e.target.value)}
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
          <Button type="button" variant="secondary" onClick={handleTestConnection}>
            Test Connection
          </Button>
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/settings/ftp')}
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

export default FTPConnectionFormPage;
