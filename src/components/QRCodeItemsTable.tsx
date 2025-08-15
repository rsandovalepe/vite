import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { fetchWithAuth } from '@/lib/api'

interface QRCodeItem {
  id: number
  uuid: string
  fileName: string
  createdBy?: string
  createdAt?: string
  exifCreatedAt?: string
  updatedBy?: string
  updatedAt?: string
}

interface QRCodeItemsTableProps {
  codeId: number
}

function QRCodeItemsTable({ codeId }: QRCodeItemsTableProps) {
  const [items, setItems] = useState<QRCodeItem[]>([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const loadItems = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page - 1),
      size: String(rowsPerPage),
    })
    fetchWithAuth(`http://localhost:8080/qrcode-items/qr/${codeId}?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.content)
        setTotalPages(data.totalPages ?? 1)
      })
  }, [codeId, page, rowsPerPage])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  async function deleteItem(id: number) {
    await fetchWithAuth(`http://localhost:8080/qrcode-items/${id}`, {
      method: 'DELETE',
    })
    loadItems()
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const allSelected =
    selectedIds.length > 0 && items.every((i) => selectedIds.includes(i.id))

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => [
        ...prev.filter((id) => !items.some((i) => i.id === id)),
        ...items.map((i) => i.id),
      ])
    } else {
      setSelectedIds((prev) => prev.filter((id) => !items.some((i) => i.id === id)))
    }
  }

  async function deleteSelected() {
    await Promise.all(
      selectedIds.map((id) =>
        fetchWithAuth(`http://localhost:8080/qrcode-items/${id}`, {
          method: 'DELETE',
        })
      )
    )
    setSelectedIds([])
    loadItems()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg">Items</h3>
        {selectedIds.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected items?</AlertDialogTitle>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-4 px-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
              />
            </TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>EXIF Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              data-state={selectedIds.includes(item.id) ? 'selected' : undefined}
            >
              <TableCell className="px-2">
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell>{item.fileName}</TableCell>
              <TableCell>
                {item.createdAt && new Date(item.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {item.exifCreatedAt &&
                  new Date(item.exifCreatedAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {item.fileName}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteItem(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
        <div>
          <span className="text-sm">Page {page} of {totalPages}</span>
        </div>
        <div>
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

export default QRCodeItemsTable

