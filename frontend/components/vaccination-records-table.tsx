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
} from "@tabler/icons-react"
import { Printer,  Download, DownloadCloud  } from "lucide-react"
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
import { Clock, Loader2 } from "lucide-react"

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

// Current date and user login
const CURRENT_DATE_TIME = "2025-06-15 15:53:25";
const CURRENT_USER = "HarnoorSingh1234";

export const schema = z.object({
  id: z.string(),
  vaccine_name: z.string(),
  dose_number: z.number(),
  administered_date: z.string(),
  disease_prevented: z.string(),
  notes: z.string(),
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

interface VaccinationHistoryTableProps {
  userId: string
}

export function VaccinationHistoryTable({ userId }: VaccinationHistoryTableProps) {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pdfGenerating, setPdfGenerating] = React.useState(false)

  const downloadPDF = () => {
    if (data.length === 0) {
      toast.error("No vaccination history data to download");
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
      pdf.text("SureShot - Vaccination History", 20, 20);
      
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
      
      // Add vaccination count summary
      pdf.setFontSize(12);
      pdf.setTextColor(0, 100, 0);
      pdf.text(`Total Vaccinations: ${data.length}`, 20, 45);
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 50, 190, 50);
      
      // Add table headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Vaccine", 20, 60);
      pdf.text("Date", 80, 60);
      pdf.text("Dose", 115, 60);
      pdf.text("Disease", 140, 60);
      
      // Add table content
      let y = 70;
      data.forEach((record, index) => {
        // Add a new page if we're running out of space
        if (y > 270) {
          pdf.addPage();
          y = 20;
          
          // Add table headers on new page
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text("Vaccine", 20, y);
          pdf.text("Date", 80, y);
          pdf.text("Dose", 115, y);
          pdf.text("Disease", 140, y);
          y += 10;
        }
        
        // Alternating row background
        if (index % 2 === 0) {
          pdf.setFillColor(240, 248, 240); // Light green for even rows
          pdf.rect(15, y - 5, 180, 10, 'F');
        }
        
        // Write data
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        pdf.text(record.vaccine_name, 20, y);
        
        // Format date
        const administeredDate = new Date(record.administered_date).toLocaleDateString();
        pdf.text(administeredDate, 80, y);
        
        // Dose number with circle
        pdf.setDrawColor(0, 100, 0);
        pdf.setFillColor(0, 128, 0);
        pdf.circle(120, y - 2, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(record.dose_number.toString(), 119, y - 1);
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        
        // Disease prevented
        pdf.text(
          record.disease_prevented.length > 15 ? 
            `${record.disease_prevented.substring(0, 15)}...` : 
            record.disease_prevented, 
          140, 
          y
        );
        
        // Add notes if available
        if (record.notes) {
          y += 8;
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Notes: ${record.notes.substring(0, 50)}${record.notes.length > 50 ? '...' : ''}`, 25, y);
        }
        
        y += 15; // Move to next row with spacing
      });
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`SureShot - Page ${i} of ${pageCount}`, pdf.internal.pageSize.width / 2, 290, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`Vaccination_History_${CURRENT_DATE_TIME.replace(/[: ]/g, '_')}.pdf`);
      
      toast.success("Vaccination history PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGenerating(false);
    }
  };

  const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
      accessorKey: "administered_date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="text-gray-300">{new Date(row.original.administered_date).toLocaleDateString()}</div>
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
      cell: ({ row }) => <div className="max-w-xs truncate text-gray-300">{row.original.notes}</div>,
    },
  ]

  const fetchVaccinationHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vaccination/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      setData(response.data)
    } catch (error) {
      console.error("Error fetching vaccination history:", error)
      toast.error("Failed to load vaccination history")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchVaccinationHistory()
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
        <span>Loading vaccination history...</span>
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
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Vaccination History</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadPDF}
              disabled={pdfGenerating || data.length === 0}
              className="ml-2 text-gray-300 hover:text-[#8ed500] hover:bg-[#8ed500]/10"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <DownloadCloud className="h-4 w-4 mr-2" />
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
                      No vaccination history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </motion.div>

    
    </motion.div>
  )
}