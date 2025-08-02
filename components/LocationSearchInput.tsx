import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface LocationSearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (value: string) => void
  suggestions: string[]
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  )

  const handleSelect = (suggestion: string) => {
    onSelect(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="pl-10"
        required
      />
      {showSuggestions && value && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 border border-gray-200 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={() => handleSelect(suggestion)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}