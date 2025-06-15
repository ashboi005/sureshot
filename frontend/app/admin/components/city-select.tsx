"use client"

import * as React from "react"
import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { popularIndianCities, CityOption } from "@/lib/cities"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/forms/select-black"
import { Input } from "./ui/core/input"
import { Search } from "lucide-react"

interface CitySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export const CitySelect = React.memo(function CitySelect({ 
  value, 
  onValueChange, 
  placeholder = "Select a city", 
  disabled 
}: CitySelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) {
      return popularIndianCities
    }
    
    const term = searchTerm.toLowerCase().trim()
    return popularIndianCities.filter((city: CityOption) =>
      city.label.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const handleValueChange = useCallback((newValue: string) => {
    onValueChange?.(newValue)
    setSearchTerm("") // Reset search when a value is selected
    setIsOpen(false)
  }, [onValueChange])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setSearchTerm(e.target.value)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchTerm("") // Reset search when dropdown closes
    }
  }, [])

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  return (
    <Select 
      value={value} 
      onValueChange={handleValueChange} 
      disabled={disabled}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 border-b sticky top-0 bg-white z-10" onMouseDown={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />            <Input
              ref={searchInputRef}
              placeholder="Search cities..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 text-black bg-white border-gray-300 placeholder-gray-500"
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                // Prevent Enter from submitting forms
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>        <div className="max-h-60 overflow-y-auto">
          {filteredCities.length > 0 ? (
            filteredCities.map((city: CityOption, index: number) => (
              <SelectItem 
                key={`${city.value}-${index}`}
                value={city.value}
              >
                {city.label}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500 text-sm">
              No cities found matching "{searchTerm}".
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )
})

// Default export for compatibility
export default CitySelect

