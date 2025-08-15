import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { MoreHorizontal } from 'lucide-react'
import { fetchWithAuth } from '@/lib/api'
import { type QRCodeType } from '@/types/qrcode'
import { Badge } from '@/components/ui/badge'

interface QRCode {
  id: number
  uuid: string
  blob: string
  description: string
  createdAt: string
  createdBy?: string
  type?: QRCodeType
}

function QRCodesPage() {
  const [codes, setCodes] = useState<QRCode[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const paginated = codes ?? []

  const loadCodes = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page - 1),
      size: String(rowsPerPage),
    })
    fetchWithAuth(`http://localhost:8080/qrcodes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) {
          setCodes([])
          setTotalPages(1)
          return
        }
        const content = Array.isArray(data) ? data : data.content
        setCodes(content ?? [])
        setTotalPages(data.totalPages ?? 1)
        setError('')
      })
      .catch(() => {
        setCodes([])
        setTotalPages(1)
        setError('Failed to load QR codes.')
      })
  }, [page, rowsPerPage])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  async function createCode() {
    try {
      await fetchWithAuth('http://localhost:8080/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'EVENT' }),
      })
      loadCodes()
    } catch {
      setError('You are not authorized to create QR codes.')
    }
  }


  async function deleteCode(id: number) {
    try {
      await fetchWithAuth(`http://localhost:8080/qrcodes/${id}`, {
        method: 'DELETE',
      })
      loadCodes()
    } catch {
      setError('You are not authorized to delete QR codes.')
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const allSelected =
    selectedIds.length > 0 &&
    paginated.every((c) => selectedIds.includes(c.id))

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => [
        ...prev.filter((id) => !paginated.some((c) => c.id === id)),
        ...paginated.map((c) => c.id),
      ])
    } else {
      setSelectedIds((prev) => prev.filter((id) => !paginated.some((c) => c.id === id)))
    }
  }

  async function deleteSelected() {
    await Promise.all(
      selectedIds.map((id) =>
        fetchWithAuth(`http://localhost:8080/qrcodes/${id}`, {
          method: 'DELETE',
        })
      )
    )
    setSelectedIds([])
    loadCodes()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>QR Codes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      <div className="flex gap-2">
          <Button size="sm" onClick={createCode}>Add</Button>
          {selectedIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete selected codes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteSelected}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-4 px-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
              />
            </TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>UUID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((c) => (
            <TableRow
              key={c.id}
              data-state={selectedIds.includes(c.id) ? 'selected' : undefined}
              onClick={() =>
                navigate(`/qrcodes/${c.uuid}`, { state: { fromQRCodes: true } })
              }
            >
              <TableCell className="px-2">
                <Checkbox
                  checked={selectedIds.includes(c.id)}
                  onCheckedChange={() => toggleSelect(c.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                {c.createdBy && <Badge variant="secondary">{c.createdBy}</Badge>}
              </TableCell>
              <TableCell>{c.uuid}</TableCell>
              <TableCell>{c.type}</TableCell>
              <TableCell>{c.description}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu
                  open={openMenuId === c.id}
                  onOpenChange={(open) =>
                    setOpenMenuId(open ? c.id : null)
                  }
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/qrcodes/${c.uuid}/edit`, { state: { fromQRCodes: true } })
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog
                      onOpenChange={(open) => {
                        if (!open) setOpenMenuId(null)
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {c.uuid}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                            }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteCode(c.id)
                              setOpenMenuId(null)
                            }}
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
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <span className="text-sm">Page {page} of {totalPages}</span>
        </div>
        <div className="">
          <Pagination className="mt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>        
        </div>
      </div>

    </div>
  )
}

export default QRCodesPage

