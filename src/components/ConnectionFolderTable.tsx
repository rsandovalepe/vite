import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
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
import { fetchWithAuth } from '@/lib/api'

export interface ConnectionFolder {
  id: number
  enabled: boolean
  name: string
  path: string
}

interface ConnectionFolderTableProps {
  selectedIds?: number[]
  onSelectedIdsChange?: (ids: number[]) => void
  connections?: ConnectionFolder[]
  readOnly?: boolean
}

function ConnectionFolderTable({
  selectedIds = [],
  onSelectedIdsChange,
  connections: initialConnections,
  readOnly,
}: ConnectionFolderTableProps) {
  const [connections, setConnections] = useState<ConnectionFolder[]>(initialConnections || [])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (!initialConnections) {
      fetchWithAuth('http://localhost:8080/folder-connections')
        .then((res) => res.json())
        .then((data) => setConnections(data))
        .catch(() => {})
    } else {
      setConnections(initialConnections)
    }
  }, [initialConnections])

  const start = (page - 1) * rowsPerPage
  const paginated = connections.slice(start, start + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(connections.length / rowsPerPage))
  const allSelected =
    !readOnly && selectedIds.length > 0 && paginated.every((c) => selectedIds.includes(c.id))

  function toggleSelect(id: number) {
    if (!onSelectedIdsChange) return
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectedIdsChange([...selectedIds, id])
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (!onSelectedIdsChange) return
    if (checked) {
      onSelectedIdsChange([
        ...selectedIds.filter((id) => !paginated.some((c) => c.id === id)),
        ...paginated.map((c) => c.id),
      ])
    } else {
      onSelectedIdsChange(
        selectedIds.filter((id) => !paginated.some((c) => c.id === id))
      )
    }
  }

  return (
    <div>
      <h3 className="text-lg">Connection Folder</h3>
      <Table>
        <TableHeader>
          <TableRow>
            {!readOnly && (
              <TableHead className="w-4 px-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                />
              </TableHead>
            )}
            <TableHead>Name</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Polling Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((c) => (
            <TableRow
              key={c.id}
              data-state={!readOnly && selectedIds.includes(c.id) ? 'selected' : undefined}
            >
              {!readOnly && (
                <TableCell className="px-2">
                  <Checkbox
                    checked={selectedIds.includes(c.id)}
                    onCheckedChange={() => toggleSelect(c.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.path}</TableCell>
              <TableCell>{c.enabled ? 'Yes' : 'No'}</TableCell>
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

export default ConnectionFolderTable
