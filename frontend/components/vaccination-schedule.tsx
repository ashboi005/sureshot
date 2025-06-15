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
  IconQrcode,
  IconDownload,
} from "@tabler/icons-react"
import { Printer } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"
import { jsPDF } from "jspdf"
import { motion } from "framer-motion"
import { Clock, Download, Loader2 } from "lucide-react"

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
  DialogDescription,
} from "@/components/ui/dialog"

// Current date and user login - updated as requested
const CURRENT_DATE_TIME = "2025-06-15 16:20:04";
const CURRENT_USER = "HarnoorSingh1234";

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
      className="text-gray-400 size-7 hover:bg-transparent hover:text-[#8ed500]"
    >
      <IconGripVertical className="size-3" />
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
  const [pdfGenerating, setPdfGenerating] = React.useState(false)

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
  
  const downloadPDF = () => {
    if (data.length === 0) {
      toast.error("No vaccination schedule data to download");
      return;
    }
    
    setPdfGenerating(true);
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 128, 0); // Green color for title
      pdf.text("VaxTrack - Vaccination Schedule", 20, 20);
      
      // Add logo placeholder
      pdf.setDrawColor(0, 128, 0);
      pdf.setFillColor(0, 128, 0);
      pdf.circle(175, 15, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text("V", 173, 19);
      
      // Add metadata
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${CURRENT_DATE_TIME}`, 20, 30);
      pdf.text(`User: ${CURRENT_USER}`, 20, 35);
      
      // Add schedule count summary
      pdf.setFontSize(12);
      pdf.setTextColor(0, 100, 0);
      
      const administered = data.filter(s => s.is_administered).length;
      const pending = data.filter(s => !s.is_administered && !s.is_overdue).length;
      const overdue = data.filter(s => s.is_overdue).length;
      
      pdf.text(`Total Schedules: ${data.length}`, 20, 45);
      pdf.text(`Administered: ${administered} | Pending: ${pending} | Overdue: ${overdue}`, 20, 52);
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 58, 190, 58);
      
      // Add table headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Vaccine", 20, 65);
      pdf.text("Dose", 75, 65);
      pdf.text("Due Date", 100, 65);
      pdf.text("Status", 140, 65);
      pdf.text("Disease", 170, 65);
      
      // Add table content
      let y = 75;
      data.forEach((schedule, index) => {
        // Add a new page if we're running out of space
        if (y > 270) {
          pdf.addPage();
          y = 20;
          
          // Add table headers on new page
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text("Vaccine", 20, y);
          pdf.text("Dose", 75, y);
          pdf.text("Due Date", 100, y);
          pdf.text("Status", 140, y);
          pdf.text("Disease", 170, y);
          y += 10;
        }
        
        // Set row background based on status
        if (schedule.is_administered) {
          pdf.setFillColor(240, 255, 240); // Light green for administered
        } else if (schedule.is_overdue) {
          pdf.setFillColor(255, 240, 240); // Light red for overdue
        } else {
          pdf.setFillColor(255, 250, 220); // Light yellow for pending
        }
        pdf.rect(15, y - 5, 180, 10, 'F');
        
        // Write data
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        pdf.text(schedule.vaccine_name, 20, y);
        pdf.text(`Dose ${schedule.dose_number}`, 75, y);
        pdf.text(new Date(schedule.due_date).toLocaleDateString(), 100, y);
        
        // Status text with color
        const status = schedule.is_administered ? "Vaccinated" : 
                      schedule.is_overdue ? "Overdue" : "Pending";
        
        pdf.setTextColor(
          schedule.is_administered ? 0 : schedule.is_overdue ? 200 : 150,
          schedule.is_administered ? 128 : schedule.is_overdue ? 0 : 120,
          schedule.is_overdue ? 0 : 0
        );
        pdf.text(status, 140, y);
        
        // Disease prevented
        pdf.setTextColor(0, 0, 0);
        const diseaseName = schedule.disease_prevented.length > 15 ? 
                          `${schedule.disease_prevented.substring(0, 15)}...` : 
                          schedule.disease_prevented;
        pdf.text(diseaseName, 170, y);
        
        // Add notes if available
        if (schedule.notes) {
          y += 8;
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Notes: ${schedule.notes.substring(0, 50)}${schedule.notes.length > 50 ? '...' : ''}`, 25, y);
        }
        
        y += 15; // Move to next row with spacing
      });
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`VaxTrack - Page ${i} of ${pageCount}`, pdf.internal.pageSize.width / 2, 290, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`Vaccination_Schedule_${CURRENT_DATE_TIME.replace(/[: ]/g, '_')}.pdf`);
      
      toast.success("Vaccination schedule PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGenerating(false);
    }
  };

  const columns: ColumnDef<VaccinationSchedule>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "vaccine_name",
      header: "Vaccine Name",
      cell: ({ row }) => <div className="font-medium text-white">{row.original.vaccine_name}</div>,
    },
    {
      accessorKey: "dose_number",
      header: "Dose Number",
      cell: ({ row }) => <div className="text-gray-300">Dose {row.original.dose_number}</div>,
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => (
        <div className="text-gray-300">{new Date(row.original.due_date).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "disease_prevented",
      header: "Disease Prevented",
      cell: ({ row }) => <div className="text-gray-300">{row.original.disease_prevented}</div>,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-gray-300">{row.original.notes || "N/A"}</div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        return row.original.is_administered ? (
          <Badge className="bg-[#8ed500]/20 text-[#8ed500] border border-[#8ed500]/30 hover:bg-[#8ed500]/20">
            Vaccinated
          </Badge>
        ) : row.original.is_overdue ? (
          <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/20">
            Overdue
          </Badge>
        ) : (
          <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20">
            Pending
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm"
          className="border-[#333] hover:bg-[#8ed500]/10 hover:text-[#8ed500] hover:border-[#8ed500]/30"
          onClick={() => generateQRCode(
            row.original.vaccine_template_id,
            row.original.vaccine_name,
            row.original.dose_number
          )}
        >
          <IconQrcode className="mr-2 h-4 w-4" />
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
        <span>Loading vaccination schedule...</span>
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Vaccination Schedule</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadPDF}
              disabled={pdfGenerating || data.length === 0}
              className="text-gray-300 hover:text-[#8ed500] hover:bg-[#8ed500]/10"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
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
                    {column.columnDef.header as string}
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
                      <TableHead key={header.id} className="text-[#8ed500] font-medium h-10">
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
                      No vaccination schedule found.
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
            <DialogTitle className="text-white">Vaccination QR Code</DialogTitle>
            {currentVaccine && (
              <DialogDescription className="text-gray-400">
                Scan this code for {currentVaccine.vaccine_name}, Dose {currentVaccine.dose_number}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrImageUrl && (
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={qrImageUrl} 
                  alt="Vaccination QR Code" 
                  className="w-56 h-56"
                />
              </div>
            )}
            <div className="w-full">
              {currentVaccine && (
                <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Vaccine:</span>
                      <p className="font-medium text-white">{currentVaccine.vaccine_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Dose:</span>
                      <p className="font-medium text-white">{currentVaccine.dose_number}</p>
                    </div>
                  </div>
                </div>
              )}
              <Button 
                onClick={downloadQRCode} 
                className="w-full bg-[#8ed500] hover:bg-[#a0ff00] text-[#141414] font-medium"
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}