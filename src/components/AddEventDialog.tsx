import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { fetchWithAuth } from '@/lib/api'
import { toast } from 'sonner'

interface QRCode {
  id: number
  uuid?: string
  description?: string
}

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (code: QRCode) => void
}

function AddEventDialog({ open, onOpenChange, onCreated }: AddEventDialogProps) {
  const [title, setTitle] = useState('')

  async function createEvent() {
    const res = await fetchWithAuth('http://localhost:8080/qrcodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: title, type: 'EVENT' }),
    })
    const code: QRCode = await res.json()
    setTitle('')
    onOpenChange(false)
    toast.success(`${code.description || code.uuid} has been created!`)
    onCreated?.(code)
    window.dispatchEvent(new CustomEvent('eventCreated', { detail: code }))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setTitle('')
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>What's the event title?</DialogDescription>
        </DialogHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
        <DialogFooter>
          <Button onClick={createEvent}>Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddEventDialog

