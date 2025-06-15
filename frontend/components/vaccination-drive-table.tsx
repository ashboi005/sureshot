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
  IconDownload,
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
import { Clock, Download, Loader2 } from "lucide-react"
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
import { motion } from "framer-motion"

// Current date and time
const CURRENT_DATE_TIME = "2025-06-15 15:15:27";
const CURRENT_USER = "HarnoorSingh1234";

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
      className="text-gray-400 size-7 hover:bg-transparent hover:text-[#8ed500]"
    >
      <IconGripVertical className="size-3" />
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
  const handleDownloadCSV = () => {
    if (data.length === 0) {
      toast.warning("No data to download")
      return
    }

    // Create CSV headers
    const headers = [
      "Drive Name",
      "Status",
      "City",
      "Start Date",
      "End Date",
      "Assigned Workers"
    ]

    // Create CSV rows
    const rows = data.map(item => {
      const now = new Date()
      const start = new Date(item.start_date)
      const end = new Date(item.end_date)

      let status = "Upcoming"
      if (now > start && now < end) status = "Ongoing"
      else if (now > end) status = "Completed"

      return [
        `"${item.vaccination_name}"`,
        status,
        `"${item.vaccination_city}"`,
        `"${new Date(item.start_date).toLocaleDateString()}"`,
        `"${new Date(item.end_date).toLocaleDateString()}"`,
        item.assigned_workers.length
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vaccination_drives_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const generateQRCode = async (driveId: string, driveName: string) => {
    setCurrentDrive({ driveId, driveName })

    const url = `/worker/${userId}/${driveId}`

    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#8ed500',
          light: '#141414'
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
      cell: ({ row }) => <div className="font-medium text-white">{row.original.vaccination_name}</div>,
    },
  {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const now = new Date()
        const start = new Date(row.original.start_date)
        const end = new Date(row.original.end_date)

        let status = "Upcoming"
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
        let className = "bg-blue-500/20 text-blue-300 border-blue-500/30"
       
        if (now > start && now < end) {
          status = "Ongoing"
          variant = "outline"
          className = "bg-[#8ed500]/20 text-[#8ed500] border-[#8ed500]/30"
        } else if (now > end) {
          status = "Completed"
          variant = "destructive"
          className = "bg-gray-500/20 text-gray-300 border-gray-500/30"
        }
        
        return (
          <Badge variant={variant} className={className}>
            {status}
          </Badge>
        )
      }

    },
    {
      accessorKey: "vaccination_city",
      header: "City",
      cell: ({ row }) => <div className="text-gray-300">{row.original.vaccination_city}</div>,
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="text-gray-300">{new Date(row.original.start_date).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => (
        <div className="text-gray-300">{new Date(row.original.end_date).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "assigned_workers",
      header: "Workers",
      cell: ({ row }) => <div className="text-gray-300">{row.original.assigned_workers.length}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="border-[#333] bg-[#1d1212] hover:bg-[#8ed500]/10 hover:text-[#8ed500] hover:border-[#8ed500]/30"
          onClick={() => generateQRCode(row.original.id, row.original.vaccination_name)}
        >
          <IconQrcode className="mr-2 h-4 w-4" />
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
        className={`border-b border-[#333] hover:bg-[#1c1c1c] ${isDragging ? "opacity-50 bg-[#1c1c1c]" : ""}`}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-3">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#8ed500]" />
        <span>Loading vaccination drives...</span>
      </div>
    )
  }

  return (

    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <motion.div variants={contentVariants}>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-white">Vaccination Drives</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-[#333] text-gray-300 hover:bg-[#1c1c1c] hover:text-white">

                <IconLayoutColumns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-[#1c1c1c] border-[#333] text-gray-300">

              {table.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    className="hover:bg-[#333] hover:text-white"

                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border border-[#333] overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table>
              <TableHeader className="bg-[#1c1c1c]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-[#333] hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-[#8ed500] font-medium">
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
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-400"
                    >
                      No vaccination drives found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </motion.div>

      {/* Date and User Info */}
      <motion.div 
        variants={contentVariants} 
        className="flex items-center justify-center text-xs text-gray-500 mt-6 mb-2"
      >
        <Clock className="h-3 w-3 mr-1" />
        <span>{CURRENT_DATE_TIME} UTC</span>
        <span className="mx-1">•</span>
        <span>{CURRENT_USER}</span>
      </motion.div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#141414] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Vaccination Drive QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrImageUrl && (
              <div className="p-4 bg-white rounded-lg">
                <img 
                  src={qrImageUrl} 
                  alt="Vaccination Drive QR Code" 
                  className="w-full max-w-xs"
                />
              </div>

            )}
            <div className="text-sm text-gray-400 text-center">
              <p>Scan this code to register for the vaccination drive</p>
              {currentDrive && (
                <p className="font-mono text-xs mt-2 p-2 bg-[#1c1c1c] rounded border border-[#333]">
                  {currentDrive.driveName}
                </p>
              )}
            </div>
            <Button 
              onClick={downloadQRCode} 
              className="gap-2 bg-[#141414] hover:bg-[#a0ff00] text-[#141414]"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}