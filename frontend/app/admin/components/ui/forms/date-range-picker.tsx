"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { DayPicker, DateRange } from "react-day-picker"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover"
import "react-day-picker/style.css"
import "./date-picker.css"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  minDate?: Date
  maxDate?: Date
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  className,
  placeholder = "Select date range",
  minDate,
  maxDate
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate
  })

  // Update local range when props change
  useEffect(() => {
    setRange({
      from: startDate,
      to: endDate
    })
  }, [startDate, endDate])

  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange)
    
    // Call parent callbacks
    onStartDateChange?.(selectedRange?.from)
    onEndDateChange?.(selectedRange?.to)
    
    // Close popover when both dates are selected
    if (selectedRange?.from && selectedRange?.to) {
      setIsOpen(false)
    }
  }

  const formatDateRange = () => {
    if (range?.from && range?.to) {
      return `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`
    }
    if (range?.from) {
      return `${format(range.from, "MMM dd, yyyy")} - End date`
    }
    return placeholder
  }

  const isValidRange = range?.from && range?.to

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
              !isValidRange && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            disabled={disabled ? true : { before: minDate || new Date() }}
            fromDate={minDate}
            toDate={maxDate}
            className="p-3"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "h-8 w-8"
              ),
              day: cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
              ),
              day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
              day_today: "bg-gray-100 text-gray-900",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-400 opacity-50",
              day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
              day_hidden: "invisible",
              day_range_start: "day-range-start",
              day_range_end: "day-range-end"
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
