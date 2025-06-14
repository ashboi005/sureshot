"use client"

import * as React from "react"
import { getCombinedCities } from "@/lib/cities"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/forms/select-black"

interface CitySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CitySelect({ value, onValueChange, placeholder = "Select a city", disabled }: CitySelectProps) {
  const cities = React.useMemo(() => getCombinedCities(), [])

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>      <SelectContent>
        {cities.map((city, index) => (
          <SelectItem 
            key={city.value === "separator" ? "separator" : `city-${city.value.replace(/\s+/g, '-').toLowerCase()}-${index}`}
            value={city.value}
            disabled={'disabled' in city ? city.disabled : false}
            className={'disabled' in city && city.disabled ? "text-gray-500 text-center" : ""}
          >
            {city.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

