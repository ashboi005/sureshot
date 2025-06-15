"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const Calendar = React.memo(({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  const memoizedClassNames = React.useMemo(() => ({
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center mb-4",
    caption_label: "text-lg font-semibold text-gray-900",
    nav: "space-x-1 flex items-center",
    nav_button: "h-8 w-8 bg-white border border-gray-300 rounded-md p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-gray-500 rounded-md w-12 h-12 font-medium text-sm flex items-center justify-center",
    row: "flex w-full mt-1",
    cell: "h-12 w-12 text-center text-sm p-0 relative hover:bg-gray-50 rounded-md",
    day: "h-12 w-12 p-0 font-normal text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-center cursor-pointer",
    day_selected: "bg-gray-900 text-white hover:bg-gray-800",
    day_today: "bg-gray-100 text-gray-900 font-semibold border border-gray-300",
    day_outside: "text-gray-400 hover:bg-gray-50",
    day_disabled: "text-gray-300 cursor-not-allowed hover:bg-transparent",
    day_hidden: "invisible",
    ...classNames,
  }), [classNames])

  const ChevronComponent = React.useCallback(({ orientation, ...chevronProps }: any) => {
    const Icon = orientation === "left" ? ChevronLeft : ChevronRight
    return <Icon className="h-4 w-4" {...chevronProps} />
  }, [])

  const memoizedComponents = React.useMemo(() => ({
    Chevron: ChevronComponent,
  }), [ChevronComponent])

  return (
    <div className={cn("p-4 bg-white rounded-lg border border-gray-200", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        classNames={memoizedClassNames}
        components={memoizedComponents}
        {...props}
      />
    </div>
  )
})

Calendar.displayName = "Calendar"

export { Calendar }
