"use client"

import * as React from "react"
import axios from "axios"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconQrcode,
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"
import QRCode from "qrcode"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const schema = z.object({
  id: z.string(),
  vaccination_name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  vaccination_city: z.string(),
  assigned_workers: z.array(z.unknown()).default([]),
})

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

export function VaccinationDrivesTable({ userId }: { userId: string }) {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([])
  const [loading, setLoading] = React.useState(true)
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false)
  const [qrImageUrl, setQrImageUrl] = React.useState("")
  const [currentDrive, setCurrentDrive] = React.useState<{
    driveId: string
    driveName: string
  } | null>(null)

  const fetchVaccinationDrives = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/active-drives`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      setData(response.data.drives)
    } catch (error) {
      console.error("Error fetching drives:", error)
      toast.error("Failed to load vaccination drives")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchVaccinationDrives()
  }, [])

  const generateQRCode = async (driveId: string, driveName: string) => {
    setCurrentDrive({ driveId, driveName })
    
    const baseUrl = window.location.origin
    const url = `${baseUrl}/doctor/${userId}/${driveId}`
    
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      setQrImageUrl(qrDataUrl)
      setQrDialogOpen(true)
    } catch (err) {
      toast.error("Failed to generate QR code")
    }
  }

  const downloadQRCode = () => {
    if (!qrImageUrl || !currentDrive) return
    
    const link = document.createElement('a')
    link.href = qrImageUrl
    link.download = `QR_${currentDrive.driveName}_${currentDrive.driveId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "vaccination_name",
      header: "Drive Name",
      cell: ({ row }) => <div className="font-medium">{row.original.vaccination_name}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const now = new Date()
        const start = new Date(row.original.start_date)
        const end = new Date(row.original.end_date)
        
        let status = "Upcoming"
        let variant: "default" | "secondary" | "destructive" = "secondary"
        
        if (now > start && now < end) {
          status = "Ongoing"
          variant = "default"
        } else if (now > end) {
          status = "Completed"
          variant = "destructive"
        }
        
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "vaccination_city",
      header: "City",
      cell: ({ row }) => <div>{row.original.vaccination_city}</div>,
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => (
        <div>{new Date(row.original.start_date).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => (
        <div>{new Date(row.original.end_date).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "assigned_workers",
      header: "Workers",
      cell: ({ row }) => <div>{row.original.assigned_workers.length}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => generateQRCode(row.original.id, row.original.vaccination_name)}
        >
          Generate QR
        </Button>
      ),
    },
  ]

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
      id: row.original.id,
    })

    return (
      <TableRow
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
        className={isDragging ? "opacity-80" : ""}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
        Loading vaccination drives...
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Vaccination Drives</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No vaccination drives found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vaccination Drive QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrImageUrl && (
              <img 
                src={qrImageUrl} 
                alt="Vaccination Drive QR Code" 
                className="w-full max-w-xs border border-gray-200 rounded-lg"
              />
            )}
            <div className="text-sm text-gray-500 text-center">
              <p>Scan this code to register for the vaccination drive</p>
              {currentDrive && (
                <p className="font-mono text-xs mt-2 p-2 bg-gray-100 rounded">
                  {currentDrive.driveName}
                </p>
              )}
            </div>
            <Button onClick={downloadQRCode} className="gap-2">
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}