'use client'

import { useState } from 'react'
import { LUNAR_RAILS_VALUES, VALUE_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ValueSelectorProps {
  selected: string[]
  onChange: (values: string[]) => void
  maxSelection?: number
}

export function ValueSelector({ selected, onChange, maxSelection = 3 }: ValueSelectorProps) {
  const toggleValue = (valueKey: string) => {
    if (selected.includes(valueKey)) {
      onChange(selected.filter((v) => v !== valueKey))
    } else if (selected.length < maxSelection) {
      onChange([...selected, valueKey])
    }
  }

  const removeValue = (valueKey: string) => {
    onChange(selected.filter((v) => v !== valueKey))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selected.map((valueKey) => {
          const value = LUNAR_RAILS_VALUES.find((v) => v.key === valueKey)
          if (!value) return null

          const colorClass = VALUE_COLORS[valueKey] || 'bg-gray-100 text-gray-800 border-gray-300'

          return (
            <Badge
              key={valueKey}
              className={`${colorClass} flex items-center gap-2 px-3 py-1.5`}
            >
              {value.label}
              <button
                onClick={() => removeValue(valueKey)}
                className="ml-1 hover:opacity-70"
              >
                <X size={14} />
              </button>
            </Badge>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {LUNAR_RAILS_VALUES.map((value) => {
          const isSelected = selected.includes(value.key)
          const colorClass = VALUE_COLORS[value.key] || 'bg-gray-100 text-gray-800 border-gray-300'

          return (
            <button
              key={value.key}
              onClick={() => toggleValue(value.key)}
              disabled={!isSelected && selected.length >= maxSelection}
              className={`text-left p-3 rounded-md border-2 transition-all ${
                isSelected
                  ? `${colorClass} border-current`
                  : 'bg-muted/50 border-muted text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="font-semibold text-sm">{value.label}</div>
              <div className="text-xs opacity-75 mt-1">{value.description}</div>
            </button>
          )
        })}
      </div>

      {selected.length >= maxSelection && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxSelection} values selected
        </p>
      )}
    </div>
  )
}
