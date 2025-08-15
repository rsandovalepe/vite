import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function TwoFactorSetupPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/users/me/2fa/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: { enabled: boolean } = await res.json();
        setEnabled(data.enabled);
      }
    }
    fetchStatus();
  }, []);

  async function handleSetup() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8080/users/me/2fa/setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: { qrImage: string; secret: string } = await res.json();
      setQr(data.qrImage);
      setSecret(data.secret);
    }
  }

  async function handleVerify() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8080/users/me/2fa/verify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret, code }),
    });
    if (res.ok) {
      const data: { status: string } = await res.json();
      if (data.status === 'verified') {
        setEnabled(true);
        setQr(null);
        setCode('');
        setSecret('');
      }
    }
  }

  async function handleDisable() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8080/users/me/2fa', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setEnabled(false);
      setQr(null);
      setSecret('');
      setCode('');
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      {!enabled && !secret && (
        <Button className="w-50" onClick={handleSetup}>
          Enable Two-Factor Auth
        </Button>
      )}
      {secret && !enabled && (
        <div className="space-y-2">
          {qr && <img src={`data:image/png;base64,${qr}`} alt="2FA QR" />}
          <p className="break-all">{secret}</p>
          <Input
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button className="w-50" onClick={handleVerify}>
            Verify Code
          </Button>
        </div>
      )}
      {enabled && (
        <div className="space-y-2">
          <Button
            className="w-50"
            variant="destructive"
            onClick={handleDisable}
          >
            Disable Two-Factor Auth
          </Button>
        </div>
      )}
    </div>
  );
}

export default TwoFactorSetupPage;
