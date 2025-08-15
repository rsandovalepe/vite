import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api';

interface QRCode {
  uuid?: string;
  description?: string;
  blob?: string;
}

function EventHomePage() {
  const [code, setCode] = useState<QRCode | null>(null);

  function loadCurrentEvent() {
    const stored = localStorage.getItem('currentEvent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { uuid?: string };
        if (parsed?.uuid) {
          fetchWithAuth(`http://localhost:8080/qrcodes/uuid/${parsed.uuid}`)
            .then((res) => res.json())
            .then((data) => setCode(data))
            .catch(() => setCode(null));
          return;
        }
      } catch {
        /* ignore */
      }
    }
    setCode(null);
  }

  useEffect(() => {
    loadCurrentEvent();
    window.addEventListener('currentEventChanged', loadCurrentEvent);
    return () => {
      window.removeEventListener('currentEventChanged', loadCurrentEvent);
    };
  }, []);

  const galleryUrl = code?.uuid
    ? `http://localhost:5173/qrcodes/${code.uuid}/gallery`
    : '';

  return code ? (
    <div className="space-y-4 px-6 py-4">
      <div>
        <h1 className="pb-2 text-2xl font-semibold">
          {code.description || code.uuid}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here you'll find everything you need to manage your party.
        </p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Your Digital Album</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The digital album lets your guests upload new photos or view
            existing ones. Share it with your guests via a direct link or using
            its unique QR code (print it or display it digitally).
          </p>
          <div className="flex items-center gap-2">
            <a
              href={galleryUrl}
              className="flex-1 truncate text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {galleryUrl}
            </a>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(galleryUrl);
                toast.success('Album URL copied!');
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button asChild size="sm">
              <a href={galleryUrl} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </Button>
          </div>
          <div className="flex justify-center">
            {code.blob && (
              <img
                src={`data:image/png;base64,${code.blob}`}
                alt="QR Code"
                className="h-40 w-40"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  ) : null;
}

export default EventHomePage;

