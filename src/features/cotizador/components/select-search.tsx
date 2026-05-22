'use client'

import { useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
  logo?: string | null
}

interface SelectSearchProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabledPlaceholder?: string
  disabled?: boolean
  loading?: boolean
}

const inputClass =
  'bg-surface border border-line-2 text-cream font-sans text-[15px] py-[13px] pr-10 outline-none transition-[border-color] duration-[180ms] w-full rounded-xl focus:border-amber placeholder:text-muted'

export function SelectSearch({
  options,
  value,
  onChange,
  placeholder,
  disabledPlaceholder,
  disabled = false,
  loading = false,
}: SelectSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value) ?? null
  const isDisabled = disabled || loading
  const hasLogo = options.some(o => o.logo)

  const displayValue = open ? query : (selectedOption?.label ?? '')

  const filtered = query ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())) : options

  const handleFocus = () => {
    if (isDisabled) return
    setQuery('')
    setOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!e.target.value) onChange('')
  }

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
      setQuery('')
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    onChange('')
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${isDisabled ? 'opacity-40' : ''}`} onBlur={handleBlur}>
      <div className="relative flex items-center">
        {selectedOption?.logo && !open && (
          <div className="absolute left-3 flex items-center pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedOption.logo}
              alt={selectedOption.label}
              width={20}
              height={20}
              className="object-contain rounded-sm"
            />
          </div>
        )}
        <input
          type="text"
          className={`${inputClass} ${isDisabled ? 'cursor-not-allowed' : ''} ${selectedOption?.logo && !open ? 'pl-10' : 'pl-4'}`}
          placeholder={loading ? 'Cargando…' : isDisabled && disabledPlaceholder ? disabledPlaceholder : placeholder}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={isDisabled}
          autoComplete="off"
        />

        {value && !isDisabled ? (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-3 text-muted hover:text-cream transition-colors duration-[180ms] bg-transparent border-none cursor-pointer p-1"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <svg
            className="pointer-events-none absolute right-3 text-muted"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface-2 border border-line-2 rounded-xl overflow-hidden z-50 max-h-[260px] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          {filtered.map(opt => (
            <li
              key={opt.value}
              onMouseDown={() => handleSelect(opt)}
              className={`flex items-center gap-3 px-4 py-[10px] text-[14px] cursor-pointer transition-colors duration-[120ms] ${
                opt.value === value ? 'text-cream bg-surface' : 'text-cream-2 hover:bg-surface hover:text-cream'
              }`}
            >
              {hasLogo && (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {opt.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={opt.logo} alt={opt.label} width={20} height={20} className="object-contain rounded-sm" />
                  ) : (
                    <div className="w-5 h-5 rounded-sm bg-surface" />
                  )}
                </div>
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {open && query && filtered.length === 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface-2 border border-line-2 rounded-xl z-50 px-4 py-[10px] text-[13px] text-muted">
          Sin resultados para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
