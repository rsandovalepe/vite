import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { fetchWithAuth } from '@/lib/api'
import AddEventDialog from '@/components/AddEventDialog'
import { toast } from 'sonner'

interface QRCode {
  id: number
  uuid?: string
  description?: string
  createdAt?: string
}

function EventsPage() {
  const [codes, setCodes] = useState<QRCode[]>([])
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [toDelete, setToDelete] = useState<QRCode | null>(null)
  const [current, setCurrent] = useState<QRCode | null>(null)
  const navigate = useNavigate()

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetchWithAuth('http://localhost:8080/qrcodes')
      const data = await res.json()
      const content = Array.isArray(data) ? data : data.content
      const sorted = (content ?? []).sort(
        (a: QRCode, b: QRCode) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      )
      setCodes(sorted)
      sorted.forEach((code: QRCode) => {
        fetchWithAuth(
          `http://localhost:8080/qrcode-items/qr/${code.id}?size=1`
        )
          .then((res) => res.json())
          .then((d) => {
            setCounts((prev) => ({
              ...prev,
              [code.id]: d.totalElements ?? (d.content ? d.content.length : 0),
            }))
          })
          .catch(() => {
            setCounts((prev) => ({ ...prev, [code.id]: 0 }))
          })
      })
      return sorted
    } catch {
      setCodes([])
      return []
    }
  }, [])

  useEffect(() => {
    loadEvents()
    const stored = localStorage.getItem('currentEvent')
    if (stored) {
      try {
        setCurrent(JSON.parse(stored) as QRCode)
      } catch {
        /* ignore */
      }
    }
  }, [loadEvents])

  async function deleteEvent(id: number) {
    await fetchWithAuth(`http://localhost:8080/qrcodes/${id}`, {
      method: 'DELETE',
    })
    const remaining = await loadEvents()
    if (current?.id === id || remaining.length === 0) {
      setCurrent(null)
      localStorage.removeItem('currentEvent')
    }
    window.dispatchEvent(new Event('currentEventChanged'))
    toast.success('The event has been deleted.')
  }

  function selectEvent(code: QRCode) {
    setCurrent(code)
    localStorage.setItem('currentEvent', JSON.stringify(code))
    window.dispatchEvent(new Event('currentEventChanged'))
    navigate('/event-home')
  }

  return (
    <div className="max-w-4xl space-y-2 px-6 py-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">My Events</h1>
        <p className="pb-2 text-sm text-muted-foreground">
          Here you can find all your events or create new ones
        </p>
        <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
          + Create new event
        </Button>
        <AddEventDialog
          open={open}
          onOpenChange={setOpen}
          onCreated={() => loadEvents()}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {codes.map((code) => (
          <Card
            key={code.id}
            onClick={() => selectEvent(code)}
            className={cn(
              'cursor-pointer',
              current?.id === code.id && 'border-2 border-primary'
            )}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {code.description || code.uuid}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setToDelete(code)
                      setDeleteText('')
                      setDeleteOpen(true)
                    }}
                  >
                    Delete this event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Items: {counts[code.id] ?? 0}</p>
              <p className="text-sm text-muted-foreground">
                {code.createdAt
                  ? `Created ${new Date(code.createdAt).toLocaleString()}`
                  : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this event?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              You're about to delete the event{' '}
              <strong>{toDelete?.description || toDelete?.uuid}</strong>.
            </p>
            <p>
              This action is irreversible and will permanently remove all data
              associated with this event, including all uploaded photos, videos,
              and any other related content.
            </p>
            <p>To confirm, please type delete in the input field below:</p>
            <Input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Type 'delete' to confirm"
            />
          </div>
          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteText !== 'delete'}
              onClick={() => {
                if (toDelete) {
                  deleteEvent(toDelete.id)
                  setDeleteOpen(false)
                  setToDelete(null)
                  setDeleteText('')
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventsPage

