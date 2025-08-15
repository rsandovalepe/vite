import { useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [requireCode, setRequireCode] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      username,
      password,
    };
    if (requireCode && code) {
      payload.code = code;
    }
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data: {
        token: string;
        roles?: { id: number; name: string }[];
        name?: string;
      } = await res.json();
      const roles = data.roles ?? [];
      localStorage.setItem('token', data.token);
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('username', username);
      if (data.name) {
        localStorage.setItem('name', data.name);
      }
      const roleNames = roles.map((r) => r.name);
      if (roleNames.includes('USER') && !roleNames.includes('ADMIN')) {
        navigate('/event-home');
      } else {
        navigate('/qrcodes');
      }
    } else {
      if (res.status === 401) {
        try {
          const err = await res.json();
          if (err.error === '2FA code required') {
            setRequireCode(true);
            return;
          }
        } catch {
          /* ignore */
        }
      }
      alert('Invalid credentials');
    }
  }

  return (
      <div className="grid grid-cols-1 place-content-center gap-4 min-h-screen">
        <div className="w-80 place-self-center">
          <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your user below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post">
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="username">User Name</Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      // value="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {requireCode && (
                  <div className="grid gap-3">
                    <Label htmlFor="code">2FA Code</Label>
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      placeholder="123456"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <Button onClick={handleSubmit}>Login</Button>
                </div>
              </div>
            </Form>
          </CardContent>
          </Card>
        </div>
      </div>
  );
}

export default LoginPage;
