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
import QRCode from "qrcode"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const schema = z.object({
  id: z.string(),
  vaccine_template_id: z.string(),
  vaccine_name: z.string(),
  dose_number: z.number(),
  due_date: z.string(),
  disease_prevented: z.string(),
  notes: z.string().nullable(),
  is_administered: z.boolean().optional(),
  is_overdue: z.boolean().optional(),
})

type VaccinationSchedule = z.infer<typeof schema>

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

function DraggableRow({ row }: { row: Row<VaccinationSchedule> }) {
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
      className={isDragging ? "bg-accent opacity-80" : ""}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

interface VaccinationScheduleTableProps {
  userId: string
}

export function VaccinationScheduleTable({ userId }: VaccinationScheduleTableProps) {
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false)
  const [qrImageUrl, setQrImageUrl] = React.useState("")
  const [currentVaccine, setCurrentVaccine] = React.useState<{
    id: string
    vaccine_name: string
    dose_number: number
  } | null>(null)
  const [data, setData] = React.useState<VaccinationSchedule[]>([])
  const [loading, setLoading] = React.useState(true)

  const generateQRCode = async (id: string, vaccine_name: string, dose_number: number) => {
    setCurrentVaccine({ id, vaccine_name, dose_number })
    
    const url = `${window.location.origin}/doctor/${userId}/${id}?dose=${dose_number}`
    
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
      console.error("QR generation error:", err)
      toast.error("Failed to generate QR code")
    }
  }

  const downloadQRCode = () => {
    if (!qrImageUrl || !currentVaccine) return
    
    const link = document.createElement('a')
    link.href = qrImageUrl
    link.download = `QR_${currentVaccine.vaccine_name.replace(/\s+/g, '_')}_Dose_${currentVaccine.dose_number}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: ColumnDef<VaccinationSchedule>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "vaccine_name",
      header: "Vaccine Name",
      cell: ({ row }) => <div className="font-medium">{row.original.vaccine_name}</div>,
    },
    {
      accessorKey: "dose_number",
      header: "Dose Number",
      cell: ({ row }) => <div>Dose {row.original.dose_number}</div>,
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => (
        <div>{new Date(row.original.due_date).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "disease_prevented",
      header: "Disease Prevented",
      cell: ({ row }) => <div>{row.original.disease_prevented}</div>,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.original.notes || "N/A"}</div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.is_administered ? "default" : "secondary"}
          className="whitespace-nowrap"
        >
          {row.original.is_administered ? "Vaccinated" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => generateQRCode(
            row.original.vaccine_template_id,
            row.original.vaccine_name,
            row.original.dose_number
          )}
        >
          Generate QR
        </Button>
      ),
    }
  ]

  const fetchVaccinationSchedule = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vaccination/schedule/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      console.log("Vaccination schedule fetched:", response.data)
      setData(response.data)
    } catch (error) {
      console.error("Error fetching vaccination schedule:", error)
      toast.error("Failed to load vaccination schedule")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchVaccinationSchedule()
  }, [userId])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
        Loading vaccination schedule...
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Vaccination Schedule</h2>
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
                  {column.columnDef.header as string}
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
                    No vaccination schedule found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vaccination QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {currentVaccine && (
              <div className="text-center">
                <h3 className="font-medium">{currentVaccine.vaccine_name}</h3>
                <p className="text-sm text-muted-foreground">Dose {currentVaccine.dose_number}</p>
              </div>
            )}
            {qrImageUrl && (
              <img 
                src={qrImageUrl} 
                alt="Vaccination QR Code" 
                className="w-48 h-48 border rounded-lg"
              />
            )}
            <Button onClick={downloadQRCode}>
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}