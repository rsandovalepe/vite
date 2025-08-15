import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import QRCodeItemsTable from '@/components/QRCodeItemsTable'
import ConnectionFTPTable, { type ConnectionFTP } from '@/components/ConnectionFTPTable'
import ConnectionFolderTable, { type ConnectionFolder } from '@/components/ConnectionFolderTable'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { fetchWithAuth } from '@/lib/api'
import { type QRCodeType } from '@/types/qrcode'
import { Badge } from '@/components/ui/badge'

interface QRCodeDetail {
  id: number
  uuid: string
  blob: string
  description?: string
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
  connectionFTPs?: ConnectionFTP[]
  connectionFolders?: ConnectionFolder[]
  type?: QRCodeType
}

function QRCodeEditPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [code, setCode] = useState<QRCodeDetail | null>(null)
  const [description, setDescription] = useState('')
  const [type, setType] = useState<QRCodeType>('EVENT')
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<number[]>([])
  const [selectedFolderConnectionIds, setSelectedFolderConnectionIds] = useState<number[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const state =
    location.state as { fromQRCodeDetail?: boolean; fromQRCodes?: boolean } | null

  useEffect(() => {
    if (!uuid) return
    fetchWithAuth(`http://localhost:8080/qrcodes/uuid/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        setCode(data)
        setDescription(data.description || '')
        setType(data.type || 'EVENT')
        setSelectedConnectionIds(
          data.connectionFTPs
            ? data.connectionFTPs.map((c: ConnectionFTP) => c.id)
            : []
        )
        setSelectedFolderConnectionIds(
          data.connectionFolders
            ? data.connectionFolders.map((c: ConnectionFolder) => c.id)
            : []
        )
      })
  }, [uuid])

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!code) return
    await fetchWithAuth(`http://localhost:8080/qrcodes/${code.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: code.id,
        description,
        type,
        connectionFTPs: selectedConnectionIds.map((id) => ({ id })),
        connectionFolders: selectedFolderConnectionIds.map((id) => ({ id })),
      }),
    })
    const destination = state?.fromQRCodeDetail
      ? `/qrcodes/${code.uuid}`
      : '/qrcodes'
    navigate(destination)
  }

  if (!code) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/qrcodes">QR Codes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Update QR Code Description</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={saveEdit} className="space-y-4">

        <div>
          <div className="grid grid-cols-3 grid-rows-4 gap-1">
            <div className="">
              <Label htmlFor="UUID">UUID</Label>
            </div>
            <div className="">
              <Label htmlFor="UUID">{code.uuid}</Label>
            </div>
            <div className="p-0 row-span-4 flex justify-end">
              {code.blob && (
                <img
                  src={`data:image/png;base64,${code.blob}`}
                  alt="QR Code"
                  className="h-20 w-20 object-contains"
                />
              )}
            </div>
            <div className="">
              <Label htmlFor="type">Type</Label>
            </div>
            <div className="">
              <Select value={type} onValueChange={(v: QRCodeType) => setType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVENT">EVENT</SelectItem>
                  <SelectItem value="EXIF_TAG_DATE_TIME_ORIGINAL">
                    EXIF_TAG_DATE_TIME_ORIGINAL
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="">
              <Label htmlFor="Description">Description</Label>
            </div>
            <div className="">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Updated By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                {code.createdAt && new Date(code.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {code.createdBy && (
                  <Badge variant="secondary">{code.createdBy}</Badge>
                )}
              </TableCell>
              <TableCell>
                {code.updatedAt && new Date(code.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {code.updatedBy && (
                  <Badge variant="secondary">{code.updatedBy}</Badge>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <ConnectionFTPTable
          selectedIds={selectedConnectionIds}
          onSelectedIdsChange={setSelectedConnectionIds}
        />

        <ConnectionFolderTable
          selectedIds={selectedFolderConnectionIds}
          onSelectedIdsChange={setSelectedFolderConnectionIds}
        />

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate(state?.fromQRCodeDetail ? `/qrcodes/${code.uuid}` : '/qrcodes')
            }
          >
            Cancel
          </Button>
        </div>
      </form>
      <QRCodeItemsTable codeId={code.id} />
    </div>
  )
}

export default QRCodeEditPage

