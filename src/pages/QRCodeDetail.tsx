import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchWithAuth } from '@/lib/api'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import QRCodeItemsTable from '@/components/QRCodeItemsTable'
import { Button } from '@/components/ui/button'
import ConnectionFTPTable, { type ConnectionFTP } from '@/components/ConnectionFTPTable'
import ConnectionFolderTable, { type ConnectionFolder } from '@/components/ConnectionFolderTable'
import { type QRCodeType } from '@/types/qrcode'

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

function QRCodeDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [code, setCode] = useState<QRCodeDetail | null>(null)

  const navigate = useNavigate()
  
  useEffect(() => {
    if (!uuid) return
    fetchWithAuth(`http://localhost:8080/qrcodes/uuid/${uuid}`)
      .then((res) => res.json())
      .then((data) => setCode(data))
  }, [uuid])


  if (!code) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/qrcodes">QR Codes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/qrcodes/${code.uuid}/gallery`)}
          >
            Gallery
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate(`/qrcodes/${code.uuid}/edit`, { state: { fromQRCodeDetail: true } })
            }
          >
            Edit
          </Button>
        </div>
      </div>

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
            <Label htmlFor="Type">{code.type}</Label>
          </div>
          <div className="">
            <Label htmlFor="Description">Description</Label>
          </div>
          <div className="">
            <Label htmlFor="email">{code.description}</Label>
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
      <ConnectionFTPTable connections={code.connectionFTPs || []} readOnly />
      <ConnectionFolderTable connections={code.connectionFolders || []} readOnly />
      <QRCodeItemsTable codeId={code.id} />
    </div>
  )
}

export default QRCodeDetailPage

